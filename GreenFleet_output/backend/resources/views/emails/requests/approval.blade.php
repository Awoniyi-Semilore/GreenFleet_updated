@extends('emails.layouts.greenfleet')

@section('content')

<h1>Transport Request Requires Your Review</h1>

<p>
    A new corporate transport request has been submitted for your review.
</p>

<p>
    <strong>Requester:</strong>
    {{ $requesterName }}
</p>

<p>
    <strong>Requested Departure:</strong>
    {{ $transportRequest->departure_date }}
    at
    {{ $transportRequest->departure_time }}
</p>

<p>
    <strong>Route:</strong>
    From <strong>{{ $transportRequest->pickup_location }}</strong>
    to <strong>{{ $transportRequest->destination }}</strong>
</p>

<p>
    <strong>Purpose:</strong>
    {{ $transportRequest->purpose }}
</p>

<p>
    <strong>Passenger Count:</strong>
    {{ $transportRequest->passenger_count }}
</p>

<p>
    <strong>Priority Level:</strong>
    {{ $transportRequest->priority }}
</p>

<p>
    Please review the request and approve or decline it through the secure actions below.
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
        Decline Request
    </a>
</p>

<p>
    These approval links are secure and expire automatically. If you decline the request,
    please provide an appropriate reason for the Transport Operations team.
</p>

<p>
    Regards,<br>
    GreenFleet Transport Operations
</p>

@endsection
