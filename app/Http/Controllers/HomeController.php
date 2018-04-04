<?php

namespace App\Http\Controllers;

use \DB;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    //
    public function showIndex(){
        return view('index');
    }

    public function traffic_logs(){

        $items=  DB::table('traffic_logs')
            ->select('id','created_at as timestamp')
            ->get();

        return response()->json($items);

    }


    public function traffic_logs_by_id($idAlert){

        if($idAlert=='latest'){
            $item = DB::table('traffic_logs')->orderBy('id', 'DESC')->first();
        }else{
            $item = DB::table('traffic_logs')->where('id',$idAlert)->first();
        }

        return response()->json($item);

    }


}
