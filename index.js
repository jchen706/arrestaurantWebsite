AWS.config.accessKeyId = 'AKIAJ7OHJBLBT3HSMBIA';
AWS.config.secretAccessKey = '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';
AWS.config.region = 'us-east-1'; // Region
try {
    var app = new Clarifai.App({
        apiKey: '1e791d6320bb47c2bd22f509e8e6dbbe'
    });
} catch (err) {
    alert("Need a valid API Key!");
    throw "Invalid API Key";
}



var text = "Good Morning!"

function encodeImageFileAsURL(element) {
    var file = element.files[0];
    var reader = new FileReader();
    var image = document.getElementById('output');
    image.src = URL.createObjectURL(element.files[0]);
    var a = document.getElementById('img4');
    a.src = image.src;
    document.getElementById("imageName").textContent = element.files[0].name;
    var type = element.files[0].name.split('.');
    var type1 = type[1];
    console.log(type1);


    reader.readAsDataURL(file);
    var foodsValue = [];
    var awsValues = [];
    var foods = [];
    var awsfoods = [];
    document.getElementById("myBtn").disabled = false;





    reader.onloadend = function() {




        //console.log('RESULT', reader.result)
        bay = reader.result.split(',')[1];
        //console.log(bae);
        app.models.predict(Clarifai.FOOD_MODEL, {
            base64: '' + bay + ''
        }).then(
            function(response) {
                var tags = new Array();
                var tag = new Array();
                var first = "";
                tag = response.outputs[0].data.concepts;
                console.log(tag);
                var len = tag.length;
                var tableContent = "";
                for (var i = 0; i < 7; i++) {

                    console.log(tag[i].name);
                    foods.push(tag[i].name);
                    foodsValue.push((parseFloat(tag[i].value)));
                    console.log(foodsValue);

                }
            },

            function(err) {
                document.getElementById("imageName").textContent = "Invalid Image: Image Size Must Be Less than 10MB or Daily API Call Limit Reached. Please Try Again!";
                // there was an error
            }

        );







        var rekognition = new AWS.Rekognition();


        var params = {
            Image: {
                Bytes: getBinary(reader.result, type1),
            }
        }


        rekognition.detectLabels(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                console.log(data.Labels);
                var data1 = data.Labels;
                console.log(data1);
                p = 0;
                for (var i = 0; i < data1.length; i++) {
                    awsfoods.push(data1[i].Name);
                    awsValues.push(parseFloat(data1[i].Confidence) / 100);
                    console.log(awsValues);
                    p++;
                    if (p == 5) {
                        break;
                    }
                }

                console.log('ok');

                for (var i = 0; i < foods.length; i++) {
                    console.log(foods);
                    console.log(awsfoods);
                    for (var j = 0; j < awsfoods.length; j++) {
                        if (foods[i] === (awsfoods[j].toLowerCase())) {
                            foodsValue[i] += awsValues[j];

                            console.log(foods[i] + " " + foodsValue[i]);
                        }
                    }
                }

                console.log(foodsValue);

                index = 0;
                for (var i = 1; i < foodsValue.length; i++) {
                    if (foodsValue[index] < foodsValue[i - 1]) {
                        index = i - 1;
                    }
                }


                findNutri(foods[index]);

            }


            //console.log(data1[0]);
            // successful response
        });

    }


}


function getBinary(encodedFile, type1) {
    if (type1.toLowerCase() == 'png') {
        var base64Image = encodedFile.split("data:image/png;base64,")[1];
    } else {
        var base64Image = encodedFile.split("data:image/jpeg;base64,")[1];

    }

    var binaryImg = atob(base64Image);
    var length = binaryImg.length;
    var ab = new ArrayBuffer(length);
    var ua = new Uint8Array(ab);
    for (var i = 0; i < length; i++) {
        ua[i] = binaryImg.charCodeAt(i);
    }

    var blob = new Blob([ab], {
        type: "image/" + type1
    });

    return ab;
}




function findNutri(food) {
    var myUrl = 'https://api.nutritionix.com/v1_1/search/' + food + '?results=0:20&fields=item_name,brand_name,item_id,nf_calories&appId=' + '4dc276e4' + '&appKey=' + 'e44918127a78d18c7c47ec51f7997d02';


    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            parseText(xhr.responseText);
        }
    };

    xhr.open('GET', myUrl, true);
    //xhr.setRequestHeader('appId', '4dc276e4');
    //xhr.setRequestHeader('appKey', 'e44918127a78d18c7c47ec51f7997d02');
    xhr.send();
}

function parseText(response) {
    var root = JSON.parse(response);
    //console.log(root);
    var arrayofFoods = root.hits;
    console.log(arrayofFoods[0]._id);

    var foodid = arrayofFoods[0]._id + "";

    var myUrl = "https://api.nutritionix.com/v1_1/item?id=" + foodid + "&appId=4dc276e4&appKey=e44918127a78d18c7c47ec51f7997d02"


    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            parseDetails(xhr.responseText);
        }
    };

    xhr.open('GET', myUrl, true);
    //xhr.setRequestHeader('appId', '4dc276e4');
    //xhr.setRequestHeader('appKey', 'e44918127a78d18c7c47ec51f7997d02');
    xhr.send();
}


function parseDetails(response) {
    var root = JSON.parse(response);
    console.log(root);


    var name = document.getElementById("foodName");
    var calorie = document.getElementById('calories1');
    var fat = document.getElementById('fat');
    var cholestral = document.getElementById('cholestral');
    var sod = document.getElementById('sodium');
    var prot = document.getElementById('protein');
    var carbo = document.getElementById('carbohydrates');
    var cal = document.getElementById('calcium');
    var vitaD = document.getElementById('vitaD');
    var vitaA = document.getElementById('vitaA');


    var item_name = root.item_name;
    name.innerHTML = item_name;

    var nf_calories = root.nf_calories;
    calorie.innerHTML = nf_calories;

    if (root.nf_total_fat !== null && root.nf_total_fat !== undefined) {
        var fatty = root.nf_total_fat;
        fat.innerHTML = fatty + ' g';
    }

    if (root.nf_cholesteral !== null && root.nf_cholesteral !== undefined) {
        var cho = root.nf_cholesteral;
        cholestral.innerHTML = cho + ' mg';
    }


    if (root.nf_total_carbohydrate != null) {
        var carbs = root.nf_total_carbohydrate;
        carbo.innerHTML = carbs + ' g';
    }

    if (root.nf_protein != null) {
        var protein = root.nf_protein;
        prot.innerHTML = protein + ' g';
    }
    if (root.nf_sodium !== null && root.nf_sodium !== undefined) {
        var sodium = root.nf_sodium;
        sod.innerHTML = sodium + ' mg';
    }

    if (root.nf.nf_calcium_dv !== undefined) {
        var calcium = root.nf_calcium_dv;
        cal.innerHTML = calcium + ' %';
    }
    if (root.nf_vitamin_a_dv != null || root.nf_vitamin_a_dv !== undefined) {
        var vitaminA = root.nf_vitamin_a_dv;
        vitaA.innerHTML = vitaminA + ' %';
    }

    if (root.nf_vitamin_d_dv !== undefined) {
        var vitaminD = root.nf_vitamin_d_dv;
        vitaD.innerHTML = vitaminD + ' %';
    }

}

function speak() {

    var polly = new AWS.Polly();

    // Function invoked by button click

    // Create synthesizeSpeech params JSON

    var name = document.getElementById('foodName');
    var cal = document.getElementById('calories1');

    console.log(name.textContent);
    console.log(cal.textContent);


    var speechParams = {
        OutputFormat: "mp3",
        SampleRate: "16000",
        Text: "Hello did you know that, " + name.textContent + " has" + cal.textContent + "calories.",
        TextType: "text",
        VoiceId: "Matthew"
    };
    var audio = document.getElementById('fun');


    polly.synthesizeSpeech(speechParams, function(err, data) {

        if (err) {
            console.log(err, err.stack);
        } else {
            var uInt8Array = new Uint8Array(data.AudioStream);
            console.log(data);
            var arrayBuffer = uInt8Array.buffer;
            var blob = new Blob([arrayBuffer]);

            console.log(audio);
            var url = URL.createObjectURL(blob);
            audio.src = url
            setTimeout(function() {
                audio.play();
                console.log('your audio is started just now');
            }, 3000);
        }
    })
}