use App\Mail\VehicleRequestSubmittedMail;
use App\Mail\VehicleRequestApprovedMail;
use App\Models\Department;
use App\Models\Setting;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

public function store(Request $request)
{
    // 1. Fetch user department to get line manager details
    $department = Department::find($request->department_id);
    
    $vehicleRequest = VehicleRequest::create([
        'requester_name'     => $request->user()->name,
        'requester_email'    => $request->user()->email,
        'department_name'    => $department->department_name ?? 'N/A',
        'line_manager_email' => $department->line_manager_email,
        'line_manager_name'  => $department->line_manager_name,
        'destination'        => $request->destination,
        'purpose'            => $request->purpose,
        'departure_time'     => $request->departure_time,
        'status'             => 'pending_approval',
        'approval_token'     => Str::random(32), // Secure token for 1-click email actions
    ]);

    // 2. Dispatch email to Line Manager if email exists
    if ($department && $department->line_manager_email) {
        Mail::to($department->line_manager_email)->queue(new VehicleRequestSubmittedMail($vehicleRequest));
    }

    return response()->json($vehicleRequest, 201);
}

public function approveAction(Request $request, $id)
{
    $vehicleRequest = VehicleRequest::findOrFail($id);

    // Verify security token
    if (!$request->token || $request->token !== $vehicleRequest->approval_token) {
        return response()->json(['message' => 'Invalid or expired action link.'], 403);
    }

    $action = $request->query('action');

    if ($action === 'approve') {
        $vehicleRequest->update([
            'status' => 'approved',
            'approval_token' => null // Invalidate token after single use
        ]);

        // Get Group Transport Email from settings
        $setting = \App\Models\Setting::where('key', 'company')->first();
        $groupEmail = $setting->value['transport_email'] ?? 'transport@greenwichmerchantbank.com';

        \Illuminate\Support\Facades\Mail::to($groupEmail)
            ->cc($vehicleRequest->requester_email)
            ->queue(new \App\Mail\VehicleRequestApprovedMail($vehicleRequest));

        return response()->json(['message' => 'Request successfully approved! Group transport team notified.']);
    } 
    
    if ($action === 'reject') {
        $vehicleRequest->update([
            'status' => 'rejected',
            'approval_token' => null
        ]);

        return response()->json(['message' => 'Request has been rejected.']);
    }

    return response()->json(['message' => 'Invalid action requested.'], 400);
}