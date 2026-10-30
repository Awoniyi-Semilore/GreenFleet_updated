@extends('emails.layouts.greenfleet')

@section('content')

<h1>Vehicle Request Approval Required</h1>

<p>
    A new vehicle request has been submitted by
    <strong>{{ $requestData->requester_name }}</strong>
    ({{ $requestData->department_name }}).
</p>

<p><strong>Request Details:</strong></p>

<p>
    <strong>Destination:</strong>
    {{ $requestData->destination }}
</p>

<p>
    <strong>Purpose:</strong>
    {{ $requestData->purpose }}
</p>

<p>
    <strong>Date & Time:</strong>
    {{ $requestData->departure_time }}
</p>

<p>
    <strong>Passengers:</strong>
    {{ $requestData->passenger_count }}
</p>

<p style="text-align: center;">
    <a
        href="{{ $approveUrl }}"
        class="button"
        style="background-color:#16803c; color:#ffffff;"
    >
        Approve Request
    </a>
</p>

<p style="text-align: center;">
    <a
        href="{{ $rejectUrl }}"
        class="button"
        style="background-color:#b42318; color:#ffffff;"
    >
        Reject Request
    </a>
</p>

<p>
    Thanks,<br>
    {{ config('app.name') }} Fleet Management
</p>

@endsection