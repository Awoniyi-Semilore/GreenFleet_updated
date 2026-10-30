<?php

namespace App\Mail;

use App\Models\TransportRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class LineManagerApprovalMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public TransportRequest $transportRequest
    ) {}

    public function build()
    {
        // Generate cryptographic signed URLs that expire after 3 days
        $approveUrl = URL::temporarySignedRoute(
            'public.request.approve',
            now()->addDays(3),
            ['id' => $this->transportRequest->id]
        );

        $rejectUrl = URL::temporarySignedRoute(
            'public.request.reject',
            now()->addDays(3),
            ['id' => $this->transportRequest->id]
        );

        return $this->markdown('emails.requests.approval')
            ->subject('Action Required: Transport Request Approval - ' . $this->transportRequest->requester->first_name . ' ' . $this->transportRequest->requester->last_name)
            ->with([
                'approveUrl' => $approveUrl,
                'rejectUrl' => $rejectUrl,
                'requesterName' => $this->transportRequest->requester->first_name . ' ' . $this->transportRequest->requester->last_name,
            ]);
    }
}