<?php

namespace App\Mail;

use App\Models\VehicleRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VehicleRequestSubmittedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $requestData;
    public $approveUrl;
    public $rejectUrl;

    public function __construct(VehicleRequest $requestData)
    {
        $this->requestData = $requestData;
        // Direct API/Web action tokens or URLs for 1-click approvals
        $baseUrl = config('app.url');
        $this->approveUrl = "{$baseUrl}/requests/action/{$requestData->id}?action=approve&token={$requestData->approval_token}";
        $this->rejectUrl = "{$baseUrl}/requests/action/{$requestData->id}?action=reject&token={$requestData->approval_token}";
    }

    public function build()
    {
        return $this->subject('Action Required: New Vehicle Request Pending Approval')
                    ->markdown('emails.requests.submitted');
    }
}