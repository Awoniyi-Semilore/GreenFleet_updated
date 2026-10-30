<?php

namespace App\Mail;

use App\Models\TransportRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TransportTeamNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public TransportRequest $transportRequest,
        public string $approvedBy
    ) {}

    public function build()
    {
        $requesterName = $this->transportRequest->requester->first_name . ' ' . $this->transportRequest->requester->last_name;

        return $this->markdown('emails.requests.transport_team_notification')
            ->subject("Approved Vehicle Request: {$requesterName}")
            ->with([
                'requesterName'  => $requesterName,
                'destination'    => $this->transportRequest->destination,
                'purpose'        => $this->transportRequest->purpose,
                'departureDate'  => $this->transportRequest->departure_date,
                'approvedBy'     => $this->approvedBy,
                'requestId'      => $this->transportRequest->id,
            ]);
    }
}