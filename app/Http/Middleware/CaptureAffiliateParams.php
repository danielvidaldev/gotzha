<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CaptureAffiliateParams
{
    private const PARAMS = ['utm_source', 'utm_campaign', 'aff_id', 'sub_id'];

    public function handle(Request $request, Closure $next): Response
    {
        $params = $request->only(self::PARAMS);
        $filtered = array_filter($params);

        if (!empty($filtered)) {
            $existing = $request->session()->get('affiliate_params', []);
            $merged = array_merge($existing, $filtered);
            $merged['landing_url'] = $request->fullUrl();
            $request->session()->put('affiliate_params', $merged);
        }

        return $next($request);
    }
}
