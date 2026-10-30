@extends('emails.layouts.greenfleet')

@section('content')

<h1>Approved Transport Request Ready for Dispatch</h1>

<p>
    <strong>{{ $requesterName }}</strong>
    submitted a transport request for travel to
    <strong>{{ $destination }}</strong>
    for
    <strong>{{ $purpose }}</strong>
    on
    <strong>{{ $departureDate }}</strong>.
</p>

<p>
    The request has been approved by
    <strong>{{ $approvedBy }}</strong>.
</p>

<p>
    Please sign in to the GreenFleet portal to assign the appropriate driver and vehicle,
    or review the request details.
</p>

<p style="text-align: center;">
    <a
    href="{{ rtrim(config('app.frontend_url'), '/') . '/admin/requests/' . $requestId }}"
    class="button"
    style="background-color:#16803c; color:#ffffff;"
    >
        Open GreenFleet Portal
    </a>
</p>

<p>
    Regards,<br>
    {{ config('app.name') }} Transport Operations
</p>

@endsection
