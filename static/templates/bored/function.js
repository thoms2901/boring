document.getElementById('lets-go').addEventListener('click', (event) => {
    get_Output();
});

document.getElementById('try-again').addEventListener('click', (event) => {
    get_Output();
});
document.getElementById('get-back').addEventListener('click', (event) => {
    $('.big-div').attr("style", "display:block;");
    $('.little-div').attr("style", "display:none;");
});

function get_Output(){
    var type = $(".activity option:selected").val();
    var participants = $(".participants option:selected").val();
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var res = JSON.parse(this.responseText);
            console.log(res);
            if (res.error)
                alert("error");
            else{
                console.log(res);
                $('.big-div').attr("style", "display:none;");
                $('.little-div').attr("style", "display:block;");
                var link = "None";
                if (res.link != ""){
                    link = "<a href=\"" + res.link +"\" target=\"_blank\">Click here!</a>";
                }
                var html = '<tr><th class="text-center px-0" scope="col">'+ res.activity+'</th><th class="text-center" scope="col">'+ res.type+'</th><th class="text-center" scope="col">'+ res.participants+'</th><th class="text-center" scope="col">'+ link+'</th></tr>';
                $('.content-bored').html(html);
            }    
        }
    };
    var url = "/getBored?";
    var and = false;
    if (type != "-1" && participants != "-1")
        and = true;
    if (type != "-1")
        url += 'type=' + type;
    if (and)
        url += "&";
    if (participants != "-1")
        url += "participants=" + participants;
    xhttp.open("GET", url, true);
    xhttp.send();
}