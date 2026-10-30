

<?php $__env->startSection('content'); ?>

<h1>Transport Request Requires Your Review</h1>

<p>
    A new corporate transport request has been submitted for your review.
</p>

<p>
    <strong>Requester:</strong>
    <?php echo new \Illuminate\Support\EncodedHtmlString($requesterName); ?>

</p>

<p>
    <strong>Requested Departure:</strong>
    <?php echo new \Illuminate\Support\EncodedHtmlString($transportRequest->departure_date); ?>

    at
    <?php echo new \Illuminate\Support\EncodedHtmlString($transportRequest->departure_time); ?>

</p>

<p>
    <strong>Route:</strong>
    From <strong><?php echo new \Illuminate\Support\EncodedHtmlString($transportRequest->pickup_location); ?></strong>
    to <strong><?php echo new \Illuminate\Support\EncodedHtmlString($transportRequest->destination); ?></strong>
</p>

<p>
    <strong>Purpose:</strong>
    <?php echo new \Illuminate\Support\EncodedHtmlString($transportRequest->purpose); ?>

</p>

<p>
    <strong>Passenger Count:</strong>
    <?php echo new \Illuminate\Support\EncodedHtmlString($transportRequest->passenger_count); ?>

</p>

<p>
    <strong>Priority Level:</strong>
    <?php echo new \Illuminate\Support\EncodedHtmlString($transportRequest->priority); ?>

</p>

<p>
    Please review the request and approve or decline it through the secure actions below.
</p>

<p style="text-align: center;">
    <a
        href="<?php echo new \Illuminate\Support\EncodedHtmlString($approveUrl); ?>"
        class="button"
        style="background-color:#16803c; color:#ffffff;"
    >
        Approve Request
    </a>
</p>

<p style="text-align: center;">
    <a
        href="<?php echo new \Illuminate\Support\EncodedHtmlString($rejectUrl); ?>"
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

<?php $__env->stopSection(); ?>

<?php echo $__env->make('emails.layouts.greenfleet', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\semilore.awoniyi\Desktop\GreenFleet_updated\GreenFleet_output\backend\resources\views/emails/requests/approval.blade.php ENDPATH**/ ?>