<?php

namespace App\Mail;

use App\Models\VehicleRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VehicleRequestApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $requestData;

    public function __construct(VehicleRequest $requestData)
    {
        $this->requestData = $requestData;
    }

    public function build()
    {
        return $this->subject('Vehicle Request Approved - Pending Allocation')
                    ->markdown('emails.requests.approved');
    }
}