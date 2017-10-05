require("../js/lib/annyang.js")
require("../css/translation-page.css")
require("../css/favicon.png")

$(document).ready(function(){
    var output = ""
    var chosenLanguage = $("#translation-language").val()
    var currentApi = $("#translator").val() === "google_translate" ? "google_translate" : "yandex_translate"
    var recognizedLanguage = $("#recognition-language").val()
    var commands = {
      "given": translateInputText,
      // "save :shortcut": {"regexp": /^save (\w+)$/, "callback": saveTranslation},
      "recognize :language": {"regexp": /^recognize (\w+)$/, "callback": setRecognizedLanguage},
      "recognise :language": {"regexp": /^recognise (\w+)$/, "callback": setRecognizedLanguage},
      "translate :language": {"regexp": /^translate (\w+)$/, "callback": setTranslationLanguage},
      "translator :translator": {"regexp": /^translator (\w+)$/, "callback": setTranslator}
    }

    var recentTranslation = {
      originalText: "",
      translatedText: "",
      originalLanguage: "",
      translatedLanguage: "",
      shortcut: ""
    }

    var callRecognizeWithAnnyang = {
      onend: recognizeWithAnnyang
    }

    var callEnableButtons = {
      onend: enableButtons
    }

    var lowerCaseLanguages = ["english", "filipino", "japanese"]
    var lowerCaseTranslators = ["google", "yandex"]

    $("#listen").on("click", recognizeWithAnnyang)
    $("#translate-given").on("click", translateInputText)
    $("#recognition-language").on("change", function(event){
      recognizedLanguage = event.target.value
    })
    $("#translation-language").on("change", function(event){
      chosenLanguage = event.target.value
    })
    $("#translator").on("change", function(event){
      currentApi = event.target.value
    })
    $("#input").on("keyup", function(event){
      $("#translate-given, #sendMessage").prop("disabled", ($("#input").val().length == 0))
    })


    function trimAndLowerCaseText(text){
      return $.trim(text).toLowerCase()
    }

    function disableButtons(){
      $("#listen, #translate-given").removeClass("btn-primary").addClass("btn-danger")
      $("#listen, #translate-given").prop("disabled", true)
    }

    function enableButtons(){
      $("#listen").html("<i class='fa fa-microphone'></i> Speak")
      $("#translate-given").text("Translate")
      $("#listen, #translate-given").removeClass("btn-danger").addClass("btn-primary")
      $("#listen, #translate-given").prop("disabled", false)
    }

    function saveTranslation(shortcut){
      recentTranslation["shortcut"] = shortcut
      $.ajax({
        type: "POST",
        url: "/save_translation",
        data: recentTranslation,
        dataType: "json",
        success: function(data){
          responsiveVoice.speak("Saved the translation", "US English Female", callRecognizeWithAnnyang)
        }
      })
    }

    function translateInputText(){
      let trimmedInput = trimAndLowerCaseText($("#input").val())
      disableButtons()
      if(trimmedInput){
        dictateTranslation(trimmedInput, chosenLanguage, currentApi, true)
      }else{
        responsiveVoice.speak("No input text to translate.", "US English Female", callEnableButtons)
      }
    }

    function setRecognizedLanguage(language){
      let trimmedLanguage = trimAndLowerCaseText(language)
      if($.inArray(trimmedLanguage, lowerCaseLanguages) !== -1){
        let new_value = "en-US"
        if(trimmedLanguage === "filipino"){
          new_value = "fil-PH"
        }else if(trimmedLanguage === "japanese"){
          new_value = "ja"
        }
        recognizedLanguage = new_value
        $("#recognition-language").val(new_value)
        responsiveVoice.speak(("Recognition language set to " + trimmedLanguage), "US English Female", callRecognizeWithAnnyang)
      }else{
        responsiveVoice.speak("Language not supported.", "US English Female", callRecognizeWithAnnyang)
      }
    }

    function setTranslationLanguage(language){
      let trimmedLanguage = trimAndLowerCaseText(language)
      if($.inArray(trimmedLanguage, lowerCaseLanguages) !== -1){
        let new_value = "en"
        if(trimmedLanguage === "filipino"){
          new_value = "tl"
        }else if(trimmedLanguage === "japanese"){
          new_value = "ja"
        }
        chosenLanguage = new_value
        $("#translation-language").val(new_value)
        responsiveVoice.speak(("Translation language set to " + trimmedLanguage), "US English Female", callRecognizeWithAnnyang)
      }else{
        responsiveVoice.speak("Language not supported.", "US English Female", callRecognizeWithAnnyang)
      }
    }

    function setTranslator(translator){
      let trimmedTranslator = trimAndLowerCaseText(translator)
      if($.inArray(trimmedTranslator, lowerCaseTranslators) !== -1){
        let new_value = trimmedTranslator === "google" ? "google_translate" : "yandex_translate"
        currentApi = $("#translator").val() === "google_translate" ? "google_translate" : "yandex_translate"
        $("#translator").val(new_value)
        responsiveVoice.speak(("Translator set to " + trimmedTranslator), "US English Female", callRecognizeWithAnnyang)
      }else{
        responsiveVoice.speak("Translator not supported.", "US English Female", callRecognizeWithAnnyang)
      }
    }

    function setRecentTranslation(originalText, translatedText, originalLanguage, translatedLanguage){
      recentTranslation["originalText"] = originalText
      recentTranslation["translatedText"] = translatedText
      recentTranslation["originalLanguage"] = originalLanguage
      recentTranslation["translatedLanguage"] = translatedLanguage
    }

    function dictateTranslation(text, selectedLanguage, api, onlyEnableButtons){
      $.ajax({
        type: "POST",
        url: "/translate",
        data: {
          text: text,
          dest: selectedLanguage,
          src: recognizedLanguage,
          api: api
        },
        dataType: "json",
        beforeSend(){
          $("#translate-given").html("<i class='fa fa-circle-o-notch fa-spin'></i> Translating...")
        },
        success: function(data){
          let callbackParameters = onlyEnableButtons ? callEnableButtons : null
          if($.trim(data.translated_text).length){
            $("#untranslated-input").val(data.original_text)
            $("#input").val(data.translated_text)
            $("#translated-input").val(data.translated_text)

            setRecentTranslation(data.original_text, data.translated_text, data.source_language, data.destination_language)

            let voiceLanguage = "Spanish Female"

            if(chosenLanguage === "ja"){
              voiceLanguage = "Japanese Female"
            }else if(chosenLanguage === "en"){
              voiceLanguage = "US English Female"
            }

            responsiveVoice.speak(data.translated_text, voiceLanguage, callbackParameters)
          }else{
            responsiveVoice.speak("No input provided", "US English Female", callbackParameters)
            $("#untranslated-input").val("")
            $("#translated-input").val("")
          }
        },
        complete: function(data){
          output = ""
        }
      })
    }

    function recognizeWithAnnyang(){
      if(annyang){
        annyang.removeCallback()
        annyang.removeCommands()

        annyang.addCallback("resultNoMatch", function(phrases){
          output = output + " " + phrases[0]
          let trimmedOutput = $.trim(output)
          dictateTranslation(trimmedOutput, chosenLanguage, currentApi)
        })

        annyang.addCallback("start", function(){
          $("#listen").html("<i class='fa fa-rss'></i> Speak now...")
          disableButtons()
        })

        annyang.addCallback("end", function(){
          enableButtons()
        })

        annyang.setLanguage(recognizedLanguage)
        annyang.addCommands(commands)
        annyang.start({autoRestart: false, continuous: false})

      }else{
        responsiveVoice.speak("Annyang Recognition API not started", "US English Female", callRecognizeWithAnnyang)
      }
  }

  $(function(){
    if($("#translation-area").length){
      // recognizeWithAnnyang()
      $("#translate-given").prop("disabled", true)
    }

  })
})
