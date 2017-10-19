var autocomplete;
var geocoder;
var lat;
var lng;
var zipcode;


//Function to get lat and lng value for a given function
function initialize() {

    var input = document.getElementById('location');
    var options = {
        types: ['(cities)']
    };
    autocomplete = new google.maps.places.Autocomplete(input,options);
    autocomplete.setComponentRestrictions(
        {'country': ['us']});

    geocoder = new google.maps.Geocoder;

    google.maps.event.addListener(autocomplete, 'place_changed',
        function() {
            var place = autocomplete.getPlace();
            var alert = document.getElementById('alert');
            var span = document.getElementsByClassName("alert-close")[0];
            if(!place.geometry)
            {
                document.getElementById('loader').style.display='none';
                document.getElementById("content").innerHTML='<h3 style="color: white">Please enter a location</h3>';
                alert.style.display = "block";
                span.onclick = function() {
                    alert.style.display = "none";
                }
                window.onclick = function(event) {
                    if (event.target == alert) {
                        alert.style.display = "none";
                    }
                }
                return true;
            }
            lat = place.geometry.location.lat();
            lng = place.geometry.location.lng();
            geocodeLatLng(geocoder);

        }
    );
}

//Function to get Zipcode from the places lat and long value;
function geocodeLatLng(geocoder) {
    var address;
    var latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
    geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === 'OK') {
            if (results[0]) {
                address = results[0].address_components;

                if(address[address.length - 1].long_name.length==5)
                {
                    zipcode = address[address.length - 1].long_name;
                }
                else if(address[address.length - 2].long_name.length==5)
                {
                    zipcode = address[address.length - 2].long_name;
                }
                else
                {
                    window.alert('No results found');
                }

            } else {
                window.alert('No results found');
            }
         } else {
            window.alert('Geocoder failed due to: ' + status);
        }
    });
}

function weatherDetails() {

    document.getElementById('loader').style.display='block';
    document.getElementById('display-weather-details').style.display='none';
    document.getElementById('footer').style.position='fixed';

    var alert = document.getElementById('alert');
    var span = document.getElementsByClassName("alert-close")[0];

    var location = document.getElementById('location').value;
    // console.log(location);

    if(autocomplete == null)
    {
        document.getElementById('loader').style.display='none';
        document.getElementById("content").innerHTML='<h3 style="color: white">Please enter a valid location</h3>';
        alert.style.display = "block";
        span.onclick = function() {
            alert.style.display = "none";
        }
        window.onclick = function(event) {
            if (event.target == alert) {
                alert.style.display = "none";
            }
        }
        return true;
    }

    var place = autocomplete.getPlace();

        if(location == "" || !place)
        {
            document.getElementById('loader').style.display='none';
            document.getElementById("content").innerHTML='<h3 style="color: white">Please enter a valid location</h3>';
            alert.style.display = "block";
            span.onclick = function() {
                alert.style.display = "none";
            }
            window.onclick = function(event) {
                if (event.target == alert) {
                    alert.style.display = "none";
                }
            }
            return true;
        }

        var country;
        for (var i = 0; i < place.address_components.length; i++) {
            var addressType = place.address_components[i].types[0];
            // for the country, get the country code (the "short name") also
            if (addressType == "country") {
                country = place.address_components[i].short_name;
            }
        }
        var url = "http://35.193.237.164:8000/api/get-weather-for-week/";
        // var url = "http://localhost:8000/api/get-weather-for-week/";
        var startDate = new Date().toISOString().slice(0,10);
        var time= new Date().getTime()-(7 * 24 * 60 * 60 * 1000);
        var endDate = new Date(time).toISOString().slice(0,10);

        $.ajax({
            url: url,
            type: "GET",
            crossDomain: true,
            dataType: "json",
            data:{zipcode:zipcode,country:country,startDate:startDate,endDate:endDate},
            success: function (response) {
                renderHtml(response);
            }
        });
}

function renderHtml(response) {

    var html = "";

    var output = JSON.parse(response.data);

    for(var i=0;i<output.length;i++)
    {
        var date = output[i].timestamp.slice(0,10);
        var minTemp = output[i].tempMin;
        var maxTemp = output[i].tempMax;

        if(i%2==0)
        {
            html = html + " <div class=\"container-timeline left\">\n" +
                "         <div class=\"content\">\n" +
                "        <i><h3>"+date+"</h3></i>\n" +
                "         <h4>Min Temp: "+minTemp +"<sup>o</sup>F</h4>\n" +
                "         <h4>Max Temp: "+maxTemp +"<sup>o</sup>F</h4>\n" +
                "     </div>\n" +
                "     </div>\n";
        }
        else
        {
              html = html + " <div class=\"container-timeline right\">\n" +
                "         <div class=\"content\">\n" +
                "        <i><h3>"+date+"</h3></i>\n" +
                "         <h4>Min Temp: "+minTemp +"<sup>o</sup>F</h4>\n" +
                "         <h4>Max Temp: "+maxTemp +"<sup>o</sup>F</h4>\n" +
                "     </div>\n" +
                "     </div>\n";

        }
    }
    document.getElementById('loader').style.display='none';
    document.getElementById('display-weather-details').innerHTML = html;
    document.getElementById('display-weather-details').style.display='block';
    document.getElementById('footer').style.position='relative';
    resetValues();

}

function resetValues() {

    var input = document.getElementById('location');
    input.value = "";
    var options = {
        types: ['(cities)']
    };
    autocomplete = new google.maps.places.Autocomplete(input,options);
    autocomplete.setComponentRestrictions(
        {'country': ['us']});


}