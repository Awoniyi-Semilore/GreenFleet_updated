<?php

namespace App\Services\Report;

use App\Models\TransportRequest;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Branch;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ReportExportService
{
    public function getReportData(string $period, ?int $branchId = null, ?int $driverId = null, ?int $vehicleId = null): array
    {
        $dateRange = $this->getDateRange($period);

        $query = TransportRequest::query()
            ->with([
                'assignment.vehicle',
                'assignment.driver.user',
                'assignment.driver.user.branch',
                'user.branch',
                'user.department',
            ])
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);

        if ($branchId) {
            $query->whereHas('user', fn($q) => $q->where('branch_id', $branchId));
        }
        if ($driverId) {
            $query->whereHas('assignment', fn($q) => $q->where('driver_id', $driverId));
        }
        if ($vehicleId) {
            $query->whereHas('assignment', fn($q) => $q->where('vehicle_id', $vehicleId));
        }

        $requests = $query->get();

        return [
            'period' => $period,
            'date_from' => $dateRange['start']->toDateString(),
            'date_to' => $dateRange['end']->toDateString(),
            'generated_at' => now()->toDateTimeString(),
            'summary' => $this->buildSummary($requests),
            'requests' => $this->buildRequestRows($requests),
            'vehicle_usage' => $this->buildVehicleUsage($requests),
            'driver_performance' => $this->buildDriverPerformance($requests),
        ];
    }

    private function getDateRange(string $period): array
    {
        $now = Carbon::now();

        return match ($period) {
            'daily' => ['start' => $now->copy()->startOfDay(), 'end' => $now->copy()->endOfDay()],
            'weekly' => ['start' => $now->copy()->startOfWeek(), 'end' => $now->copy()->endOfWeek()],
            'monthly' => ['start' => $now->copy()->startOfMonth(), 'end' => $now->copy()->endOfMonth()],
            default => ['start' => $now->copy()->startOfWeek(), 'end' => $now->copy()->endOfWeek()],
        };
    }

    private function buildSummary(Collection $requests): array
    {
        $total = $requests->count();
        $completed = $requests->where('status', 'COMPLETED')->count();
        $pending = $requests->where('status', 'PENDING')->count();
        $approved = $requests->where('status', 'APPROVED')->count();
        $rejected = $requests->where('status', 'REJECTED')->count();

        $avgApproval = $requests
            ->whereNotNull('approved_at')
            ->whereNotNull('created_at')
            ->avg(fn($r) => $r->created_at->diffInMinutes($r->approved_at));

        $avgTrip = $requests
            ->where('status', 'COMPLETED')
            ->whereNotNull('departure_time')
            ->whereNotNull('arrival_time')
            ->avg(fn($r) => $r->departure_time->diffInMinutes($r->arrival_time));

        return [
            'total_requests' => $total,
            'completed' => $completed,
            'pending' => $pending,
            'approved' => $approved,
            'rejected' => $rejected,
            'avg_approval_minutes' => $avgApproval ? round($avgApproval, 1) : 0,
            'avg_trip_minutes' => $avgTrip ? round($avgTrip, 1) : 0,
            'completion_rate' => $total > 0 ? round(($completed / $total) * 100, 1) : 0,
        ];
    }

    private function buildRequestRows(Collection $requests): array
    {
        return $requests->map(fn($r) => [
            'id' => $r->id,
            'requester' => $r->user?->full_name ?? $r->user?->name ?? 'N/A',
            'branch' => $r->user?->branch?->name ?? $r->user?->branch?->branch_name ?? 'N/A',
            'department' => $r->user?->department?->name ?? $r->user?->department?->department_name ?? '—',
            'pickup' => $r->pickup_location ?? '—',
            'destination' => $r->destination ?? '—',
            'purpose' => $r->purpose ?? '—',
            'status' => $r->status ?? '—',
            'priority' => $r->priority ?? '—',
            'passengers' => $r->passengers ?? $r->passenger_count ?? '—',
            'departure_time' => $r->departure_time?->format('Y-m-d H:i') ?? '—',
            'arrival_time' => $r->arrival_time?->format('Y-m-d H:i') ?? '—',
            'vehicle' => $r->assignment?->vehicle?->plate_number ?? $r->assignment?->vehicle?->plate ?? '—',
            'driver' => $r->assignment?->driver?->user?->full_name ?? $r->assignment?->driver?->user?->name ?? '—',
            'created_at' => $r->created_at?->format('Y-m-d H:i') ?? '—',
        ])->toArray();
    }

    private function buildVehicleUsage(Collection $requests): array
    {
        return $requests
            ->groupBy(fn($r) => $r->assignment?->vehicle?->plate_number ?? $r->assignment?->vehicle?->plate ?? 'Unassigned')
            ->map(fn($group, $plate) => [
                'plate_number' => $plate,
                'trips' => $group->count(),
                'completed' => $group->where('status', 'COMPLETED')->count(),
            ])
            ->values()
            ->toArray();
    }

    private function buildDriverPerformance(Collection $requests): array
    {
        return $requests
            ->groupBy(fn($r) => $r->assignment?->driver?->user?->full_name ?? $r->assignment?->driver?->user?->name ?? 'Unassigned')
            ->map(fn($group, $name) => [
                'driver' => $name,
                'trips' => $group->count(),
                'completed' => $group->where('status', 'COMPLETED')->count(),
            ])
            ->values()
            ->toArray();
    }
}
