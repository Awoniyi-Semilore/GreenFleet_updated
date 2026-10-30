<?php

namespace App\Http\Controllers;

use App\Models\TransportRequest;
use App\Models\TripLog;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Branch;
use App\Models\Approval;
use App\Models\Assignment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function export(Request $request)
    {
        $format = strtolower($request->input('format', 'excel'));
        $period = $request->input('period', 'weekly');
        $branchId = $request->input('branch');
        $driverId = $request->input('driver');
        $vehicleId = $request->input('vehicle');

        $data = $this->getReportData($period, $branchId, $driverId, $vehicleId);

        return $format === 'pdf'
            ? $this->exportPdf($data, $period)
            : $this->exportExcel($data, $period);
    }

    private function getReportData($period, $branchId, $driverId, $vehicleId)
    {
        // Build query with relationships
        $query = TransportRequest::with(['requester', 'approvals', 'assignment.driver', 'assignment.vehicle']);

        // Date filtering
        $now = now();
        $query->when($period === 'daily', fn($q) => $q->whereDate('created_at', $now))
              ->when($period === 'weekly', fn($q) => $q->whereBetween('created_at', [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()]))
              ->when($period === 'monthly', fn($q) => $q->whereMonth('created_at', $now->month)->whereYear('created_at', $now->year));

        // Branch filter — requester belongs to branch via user->branch relation
        // Note: only filter if your User model has a branch() relation
        if ($branchId) {
            $query->whereHas('requester', fn($q) => $q->where('branch_id', $branchId));
        }

        // Driver filter via assignment
        if ($driverId) {
            $query->whereHas('assignment', fn($q) => $q->where('driver_id', $driverId));
        }

        // Vehicle filter via assignment
        if ($vehicleId) {
            $query->whereHas('assignment', fn($q) => $q->where('vehicle_id', $vehicleId));
        }

        $requests = $query->get();

        // Stats
        $totalRequests = $requests->count();
        $approved = $requests->where('status', 'APPROVED')->count();
        $pending = $requests->where('status', 'PENDING')->count();
        $rejected = $requests->where('status', 'REJECTED')->count();
        $completed = $requests->where('status', 'COMPLETED')->count();
        $cancelled = $requests->where('status', 'CANCELLED')->count();

        // Approval time: from created_at to first approval's created_at
        $approvalTimes = $requests->filter(fn($r) => $r->approvals->isNotEmpty())
            ->map(fn($r) => $r->approvals->first()->created_at->diffInMinutes($r->created_at));
        $avgApprovalTime = $approvalTimes->isNotEmpty() ? $approvalTimes->avg() : null;

        // Trip time: from trip_logs where transport_request_id matches
        $tripLogIds = $requests->pluck('id');
        $tripTimes = TripLog::whereIn('transport_request_id', $tripLogIds)
            ->whereNotNull('arrival_time')
            ->whereNotNull('departure_time')
            ->get()
            ->map(fn($t) => \Carbon\Carbon::parse($t->arrival_time)->diffInMinutes(\Carbon\Carbon::parse($t->departure_time)));
        $avgTripTime = $tripTimes->isNotEmpty() ? $tripTimes->avg() : null;

        // Branch stats via requester's branch
        $branchStats = $requests->groupBy(fn($r) => $r->requester?->branch_id)
            ->map(fn($g) => [
                'branch' => $g->first()->requester?->branch?->branch_name
                    ?? $g->first()->requester?->branch?->name
                    ?? 'Unknown',
                'count' => $g->count(),
            ])->sortByDesc('count')->values();

        // Vehicle stats via assignment
        $vehicleStats = $requests->filter(fn($r) => $r->assignment?->vehicle)
            ->groupBy(fn($r) => $r->assignment->vehicle_id)
            ->map(fn($g) => [
                'vehicle' => $g->first()->assignment->vehicle->plate_number ?? 'Unknown',
                'count' => $g->count(),
            ])->sortByDesc('count')->values();

        // Driver stats via assignment
        $driverStats = $requests->filter(fn($r) => $r->assignment?->driver)
            ->groupBy(fn($r) => $r->assignment->driver_id)
            ->map(fn($g) => [
                'driver' => trim(($g->first()->assignment->driver->first_name ?? '') . ' ' . ($g->first()->assignment->driver->last_name ?? '')) ?: 'Unknown',
                'count' => $g->count(),
            ])->sortByDesc('count')->values();

        return compact(
            'requests', 'totalRequests', 'approved', 'pending', 'rejected', 'completed', 'cancelled',
            'avgApprovalTime', 'avgTripTime', 'branchStats', 'vehicleStats', 'driverStats', 'period'
        );
    }

    private function exportExcel($data, $period)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle(ucfirst($period) . ' Report');

        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '006527']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ];

        // Title
        $sheet->setCellValue('A1', 'GreenFleet Transport Report');
        $sheet->setCellValue('A2', 'Period: ' . ucfirst($period) . ' | Generated: ' . now()->format('Y-m-d H:i'));
        $sheet->mergeCells('A1:F1');
        $sheet->mergeCells('A2:F2');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
        $sheet->getStyle('A1:F2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Summary
        $row = 4;
        $sheet->setCellValue('A' . $row, 'Summary');
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
        $row++;

        $summary = [
            ['Metric', 'Value'],
            ['Total Requests', $data['totalRequests']],
            ['Approved', $data['approved']],
            ['Pending', $data['pending']],
            ['Rejected', $data['rejected']],
            ['Completed', $data['completed']],
            ['Cancelled', $data['cancelled']],
            ['Avg Approval Time (min)', $data['avgApprovalTime'] ? round($data['avgApprovalTime'], 1) : 'N/A'],
            ['Avg Trip Time (min)', $data['avgTripTime'] ? round($data['avgTripTime'], 1) : 'N/A'],
        ];

        foreach ($summary as $i => $line) {
            $sheet->setCellValue('A' . ($row + $i), $line[0]);
            $sheet->setCellValue('B' . ($row + $i), $line[1]);
        }
        $sheet->getStyle('A' . $row . ':B' . ($row + count($summary) - 1))->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ]);
        $sheet->getStyle('A' . $row . ':B' . $row)->applyFromArray($headerStyle);

        // Branch Stats
        $row += count($summary) + 2;
        $sheet->setCellValue('A' . $row, 'Branch Statistics');
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
        $row++;
        $sheet->fromArray(['Branch', 'Request Count'], null, 'A' . $row);
        $sheet->getStyle('A' . $row . ':B' . $row)->applyFromArray($headerStyle);
        $row++;
        foreach ($data['branchStats'] as $stat) {
            $sheet->setCellValue('A' . $row, $stat['branch']);
            $sheet->setCellValue('B' . $row, $stat['count']);
            $row++;
        }

        // Vehicle Stats
        $row += 2;
        $sheet->setCellValue('A' . $row, 'Vehicle Statistics');
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
        $row++;
        $sheet->fromArray(['Vehicle', 'Request Count'], null, 'A' . $row);
        $sheet->getStyle('A' . $row . ':B' . $row)->applyFromArray($headerStyle);
        $row++;
        foreach ($data['vehicleStats'] as $stat) {
            $sheet->setCellValue('A' . $row, $stat['vehicle']);
            $sheet->setCellValue('B' . $row, $stat['count']);
            $row++;
        }

        // Driver Stats
        $row += 2;
        $sheet->setCellValue('A' . $row, 'Driver Statistics');
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
        $row++;
        $sheet->fromArray(['Driver', 'Request Count'], null, 'A' . $row);
        $sheet->getStyle('A' . $row . ':B' . $row)->applyFromArray($headerStyle);
        $row++;
        foreach ($data['driverStats'] as $stat) {
            $sheet->setCellValue('A' . $row, $stat['driver']);
            $sheet->setCellValue('B' . $row, $stat['count']);
            $row++;
        }

        // Detailed Requests
        $row += 2;
        $sheet->setCellValue('A' . $row, 'Detailed Requests');
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
        $row++;
        $headers = ['ID', 'Requester', 'Pickup', 'Destination', 'Purpose', 'Status', 'Priority', 'Passengers', 'Created'];
        $sheet->fromArray($headers, null, 'A' . $row);
        $sheet->getStyle('A' . $row . ':I' . $row)->applyFromArray($headerStyle);
        $row++;

        foreach ($data['requests'] as $req) {
            $sheet->setCellValue('A' . $row, $req->id);
            $sheet->setCellValue('B' . $row, $req->requester?->name ?? 'N/A');
            $sheet->setCellValue('C' . $row, $req->pickup_location);
            $sheet->setCellValue('D' . $row, $req->destination);
            $sheet->setCellValue('E' . $row, $req->purpose);
            $sheet->setCellValue('F' . $row, $req->status);
            $sheet->setCellValue('G' . $row, $req->priority);
            $sheet->setCellValue('H' . $row, $req->passenger_count);
            $sheet->setCellValue('I' . $row, $req->created_at?->format('Y-m-d H:i'));
            $row++;
        }

        foreach (range('A', 'I') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'greenfleet_report_' . $period . '_' . now()->format('Ymd_His') . '.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function exportPdf($data, $period)
    {
        $pdf = Pdf::loadView('reports.transport', $data);
        $filename = 'greenfleet_report_' . $period . '_' . now()->format('Ymd_His') . '.pdf';

        return $pdf->download($filename);
    }

    public function preview(Request $request)
    {
        $period = $request->input('period', 'weekly');
        $branchId = $request->input('branch');
        $driverId = $request->input('driver');
        $vehicleId = $request->input('vehicle');

        $data = $this->getReportData($period, $branchId, $driverId, $vehicleId);

        return response()->json([
            'success' => true,
            'data' => [
                'avgApprovalTime' => $data['avgApprovalTime'] ? round($data['avgApprovalTime'], 1) . ' min' : 'N/A',
                'avgTripTime' => $data['avgTripTime'] ? round($data['avgTripTime'], 1) . ' min' : 'N/A',
                'avgRequestsPerDay' => $data['totalRequests'] > 0 
                    ? round($data['totalRequests'] / ($period === 'daily' ? 1 : ($period === 'weekly' ? 7 : 30)), 1)
                    : 0,
                'mostRequestedBranches' => $data['branchStats']->take(3)->values()->toArray(),
                'avgApprovalTrend' => $this->computeTrend($data['requests'], 'approval'),
                'avgTripTrend' => $this->computeTrend($data['requests'], 'trip'),
                'totalRequests' => $data['totalRequests'],
                'approved' => $data['approved'],
                'pending' => $data['pending'],
                'rejected' => $data['rejected'],
                'completed' => $data['completed'],
            ]
        ]);
    }

    private function computeTrend($requests, $type)
    {
        // Group by day of week/month and compute averages
        $grouped = $requests->groupBy(fn($r) => $r->created_at->format('D'));
        $days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        return collect($days)->map(function ($day) use ($grouped, $type) {
            $dayRequests = $grouped->get($day, collect());
            if ($dayRequests->isEmpty()) return 0;
            
            if ($type === 'approval') {
                $times = $dayRequests->filter(fn($r) => $r->approvals->isNotEmpty())
                    ->map(fn($r) => $r->approvals->first()->created_at->diffInMinutes($r->created_at));
                return $times->isNotEmpty() ? round($times->avg(), 1) : 0;
            }
            
            // trip type
            $ids = $dayRequests->pluck('id');
            $times = \App\Models\TripLog::whereIn('transport_request_id', $ids)
                ->whereNotNull('arrival_time')
                ->whereNotNull('departure_time')
                ->get()
                ->map(fn($t) => \Carbon\Carbon::parse($t->arrival_time)->diffInMinutes(\Carbon\Carbon::parse($t->departure_time)));
            return $times->isNotEmpty() ? round($times->avg(), 1) : 0;
        })->values()->toArray();
    }
}