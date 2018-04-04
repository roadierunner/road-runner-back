<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

// $router->get('/', function () use ($router) {
//     return $router->app->version();
// });
$router->get('/', "HomeController@showIndex");


$router->group(['prefix' => 'api'], function () use ($router) {

    $router->get('traffic-logs', "HomeController@traffic_logs");
    $router->get('traffic-logs/{idAlert}', "HomeController@traffic_logs_by_id");

});

