<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>GreenFleet Report</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { color: #006527; margin: 0; font-size: 20px; }
        .header p { color: #666; margin: 5px 0; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10px; }
        th { background: #006527; color: white; padding: 8px; text-align: left; font-weight: bold; }
        td { padding: 6px 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background: #f9f9f9; }
        .section-title { font-size: 14px; font-weight: bold; color: #006527; margin-top: 20px; margin-bottom: 8px; border-bottom: 2px solid #006527; padding-bottom: 4px; }
        .summary-grid { width: 100%; margin: 10px 0; }
        .summary-grid td { width: 25%; padding: 10px; background: #f5f5f5; border: none; text-align: center; }
        .summary-grid .label { font-size: 9px; color: #666; text-transform: uppercase; display: block; }
        .summary-grid .value { font-size: 16px; font-weight: bold; color: #006527; display: block; margin-top: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>GreenFleet Transport Report</h1>
        <p>Period: {{ ucfirst($period) }} | Generated: {{ now()->format('F j, Y H:i') }}</p>
    </div>

    <div class="section-title">Summary</div>
    <table class="summary-grid">
        <tr>
            <td><span class="label">Total</span><span class="value">{{ $totalRequests }}</span></td>
            <td><span class="label">Approved</span><span class="value">{{ $approved }}</span></td>
            <td><span class="label">Pending</span><span class="value">{{ $pending }}</span></td>
            <td><span class="label">Completed</span><span class="value">{{ $completed }}</span></td>
        </tr>
        <tr>
            <td><span class="label">Rejected</span><span class="value">{{ $rejected }}</span></td>
            <td><span class="label">Cancelled</span><span class="value">{{ $cancelled }}</span></td>
            <td><span class="label">Avg Approval</span><span class="value">{{ $avgApprovalTime ? round($avgApprovalTime, 1) . 'm' : 'N/A' }}</span></td>
            <td><span class="label">Avg Trip</span><span class="value">{{ $avgTripTime ? round($avgTripTime, 1) . 'm' : 'N/A' }}</span></td>
        </tr>
    </table>

    @if($branchStats->isNotEmpty())
    <div class="section-title">Branch Statistics</div>
    <table>
        <thead><tr><th>Branch</th><th>Requests</th></tr></thead>
        <tbody>
            @foreach($branchStats as $stat)
            <tr><td>{{ $stat['branch'] }}</td><td>{{ $stat['count'] }}</td></tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if($vehicleStats->isNotEmpty())
    <div class="section-title">Vehicle Statistics</div>
    <table>
        <thead><tr><th>Vehicle</th><th>Requests</th></tr></thead>
        <tbody>
            @foreach($vehicleStats as $stat)
            <tr><td>{{ $stat['vehicle'] }}</td><td>{{ $stat['count'] }}</td></tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if($driverStats->isNotEmpty())
    <div class="section-title">Driver Statistics</div>
    <table>
        <thead><tr><th>Driver</th><th>Requests</th></tr></thead>
        <tbody>
            @foreach($driverStats as $stat)
            <tr><td>{{ $stat['driver'] }}</td><td>{{ $stat['count'] }}</td></tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="section-title">Detailed Requests</div>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Requester</th>
                <th>Pickup</th>
                <th>Destination</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
            </tr>
        </thead>
        <tbody>
            @foreach($requests as $req)
            <tr>
                <td>{{ $req->id }}</td>
                <td>{{ $req->requester?->name ?? 'N/A' }}</td>
                <td>{{ $req->pickup_location }}</td>
                <td>{{ $req->destination }}</td>
                <td>{{ $req->purpose }}</td>
                <td>{{ $req->status }}</td>
                <td>{{ $req->priority }}</td>
                <td>{{ $req->created_at?->format('M d, Y H:i') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>