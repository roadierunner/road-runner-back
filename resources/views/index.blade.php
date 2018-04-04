<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <!-- Meta, title, CSS, favicons, etc. -->
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Road Runner | Delawer</title>

    <!-- Bootstrap -->
    <link href="./bower_components/gentelella/vendors/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="./bower_components/gentelella/vendors/font-awesome/css/font-awesome.min.css" rel="stylesheet">
    <!-- NProgress -->
    <link href="./bower_components/gentelella/vendors/nprogress/nprogress.css" rel="stylesheet">
    <!-- Custom Theme Style -->
    <link href="./bower_components/gentelella/build/css/custom.min.css" rel="stylesheet">
    <!-- Event control Style -->
    <link href="./eventcontrol.css" rel="stylesheet">
    <!-- Custom App Style -->
    <link href="./main.css" rel="stylesheet">    
  </head>

  <body class="nav-md">
    <div class="container body">
      <div class="main_container">
        <div class="col-md-3 left_col">
          <div class="left_col scroll-view">
            <div class="navbar nav_title" style="border: 0;">
              <a href="index.html" class="site_title"><i class="fa fa-car"></i> <span>Road Runner!</span></a>
            </div>

            <div class="clearfix"></div>

            <br />

            <!-- sidebar menu -->
            <div id="sidebar-menu" class="main_menu_side hidden-print main_menu">
              <div class="menu_section">
                <h3>Traffic Information</h3>
                <ul class="nav side-menu">
                  <li><a id="traffic_alerts"><i class="fa fa-bell"></i> Traffic Alerts <span class="fa fa-chevron-down"></span></a>
                    <ul id="traffic_alerts_list" class="nav child_menu">
                    </ul>
                  </li>
                  <li><a id="traffic_jams"><i class="fa fa-tag"></i> Traffic Jams </a>
                  </li>
                </ul>
              </div>
            </div>
            <!-- /sidebar menu -->
          </div>
        </div>

        <!-- top navigation -->
        <div class="top_nav">
          <div class="nav_menu">
            <nav>
              <div class="nav toggle">
                <a id="menu_toggle"><i class="fa fa-bars"></i></a>
              </div>
              <ul class="nav navbar-nav navbar-right">
                <li class="">
                  <a id="last_update">
                    <span class="fa fa-refresh"></span> Last Update: 
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <!-- /top navigation -->

        <!-- page content -->
        <div class="right_col" role="main">
          

          <div class="row">
            <div class="col-md-12 col-sm-12 col-xs-12">
              <div class="dashboard_graph">

                <div class="row x_title">
                  <div class="col-md-6">
                    <h3 id="title">Traffic Alerts <small>General alerts</small></h3>
                  </div>
                  <div class="col-md-6">
                    <div class="pull-right">
                      <i class="glyphicon glyphicon-calendar fa fa-calendar"></i>
                      <span id="data_time"></span>
                    </div>
                  </div>
                </div>

                <div class="row event-control-box">
                  <div id="event-control-container" class="col-md-12 no-margin no-padding">
                    <div class="eventcontrol-target">
                      <h5 id="event-control-text">Use the mouse to select an event</h5>
                    </div>
                    <div class="eventcontrol"></div>

                  </div>
                </div>

                <div class="row">

                <div class="col-md-12 col-sm-12 col-xs-12">                
                  <input id="pac-input" class="controls clearable" type="search" placeholder="Search Box" style="display:none;">
                  <div id="map"></div>
                </div>
                <div class="clearfix"></div>
              </div>
              </div>
            </div>
        </div>
        <!-- /page content -->

        <!-- footer content -->
        <footer>
          <div class="pull-right">
            &copy; Road Runner - 2017 <a href="">Road Runner</a>
          </div>
          <div class="clearfix"></div>
        </footer>
        <!-- /footer content -->
      </div>
    </div>

    <!-- jQuery -->
    <script src="./bower_components/gentelella/vendors/jquery/dist/jquery.min.js"></script>
    <!-- Bootstrap -->
    <script src="./bower_components/gentelella/vendors/bootstrap/dist/js/bootstrap.min.js"></script>
    <!-- FastClick -->
    <script src="./bower_components/gentelella/vendors/fastclick/lib/fastclick.js"></script>
    <!-- NProgress -->
    <script src="./bower_components/gentelella/vendors/nprogress/nprogress.js"></script>
    <!-- DateJS -->
    <script src="./bower_components/gentelella/vendors/DateJS/build/date.js"></script>
    <!-- Custom Theme Scripts -->
    <script src="./bower_components/gentelella/build/js/custom.min.js"></script>

    <!-- Event control libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.6/hammer.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.12.0/moment.min.js"></script>
    <script src="./eventcontrol.min.js"></script>


      <!-- Google Maps JS -->
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDHY3K5UAZaG5C2C1pKKpyfCmjTdVCuWF0&libraries=places&extension=.js"></script>        

    <!-- Main JS -->
    <script type="text/javascript">
      var main_url = "{{ URL::to('/') }}";
    </script>
    <script src="./main.min.js"></script>

  </body>
</html>
