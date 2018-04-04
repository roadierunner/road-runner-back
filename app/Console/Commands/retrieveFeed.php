<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use DB;

class retrieveFeed extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'retrieve:feed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'retrieve feed';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }


    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $client = new \GuzzleHttp\Client();
        $request = new \GuzzleHttp\Psr7\Request('GET', env('REMOTE_URL'), [
            'Origin' => "http://traffic-alerts.devpal.io",
            'Access-Control-Request-Headers' => "x-requested-with",
            'proxy' => 'tcp://167.21.40.10:8080'
        ]);
        $promise = $client->sendAsync($request)->then(function ($response) {
            $this->line("Status: ". $response->getStatusCode());
            if ($response->getStatusCode() == 200){
                DB::table('traffic_logs')->insert([
                    "feed" => (string) $response->getBody(),
                    "created_at" => new \Carbon\Carbon()
                ]);
            }
        });
        $promise->wait();
        $this->line('Its done');
    }
}