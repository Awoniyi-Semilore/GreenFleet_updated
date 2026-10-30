@extends('emails.layouts.greenfleet')

@section('content')

<h1>Transport Request Approved</h1>

<p>
    The vehicle request for
    <strong>{{ $requestData->requester_name }}</strong>
    has been approved by line manager
    <strong>{{ $requestData->line_manager_name }}</strong>.
</p>

<p><strong>Trip Summary:</strong></p>

<p>
    <strong>Department:</strong>
    {{ $requestData->department_name }}
</p>

<p>
    <strong>Destination:</strong>
    {{ $requestData->destination }}
</p>

<p>
    <strong>Departure Time:</strong>
    {{ $requestData->departure_time }}
</p>

<p>
    Please sign in to the GreenFleet portal to assign a vehicle and driver and complete the dispatch process.
</p>

<p>
    Regards,<br>
    {{ config('app.name') }} Transport Operations
</p>

@endsection
