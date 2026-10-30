

<?php $__env->startSection('content'); ?>

<h1>Approved Transport Request Ready for Dispatch</h1>

<p>
    <strong><?php echo new \Illuminate\Support\EncodedHtmlString($requesterName); ?></strong>
    submitted a transport request for travel to
    <strong><?php echo new \Illuminate\Support\EncodedHtmlString($destination); ?></strong>
    for
    <strong><?php echo new \Illuminate\Support\EncodedHtmlString($purpose); ?></strong>
    on
    <strong><?php echo new \Illuminate\Support\EncodedHtmlString($departureDate); ?></strong>.
</p>

<p>
    The request has been approved by
    <strong><?php echo new \Illuminate\Support\EncodedHtmlString($approvedBy); ?></strong>.
</p>

<p>
    Please sign in to the GreenFleet portal to assign the appropriate driver and vehicle,
    or review the request details.
</p>

<p style="text-align: center;">
    <a
    href="<?php echo new \Illuminate\Support\EncodedHtmlString(rtrim(config('app.frontend_url'), '/') . '/admin/requests/' . $requestId); ?>"
    class="button"
    style="background-color:#16803c; color:#ffffff;"
    >
        Open GreenFleet Portal
    </a>
</p>

<p>
    Regards,<br>
    <?php echo new \Illuminate\Support\EncodedHtmlString(config('app.name')); ?> Transport Operations
</p>

<?php $__env->stopSection(); ?>

<?php echo $__env->make('emails.layouts.greenfleet', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\semilore.awoniyi\Desktop\GreenFleet_updated\GreenFleet_output\backend\resources\views/emails/requests/transport_team_notification.blade.php ENDPATH**/ ?>