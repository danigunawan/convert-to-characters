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
      "save :shortcut": {"regexp": /^save (\w+)$/, "callback": saveTranslation},
      "recognize :language": {"regexp": /^recognize (\w+)$/, "callback": setRecognizedLanguage},
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

    var parameters = {
      onend: recognizeWithAnnyang
    }

    var lowerCaseLanguages = ["english", "filipino", "japanese"]
    var lowerCaseTranslators = ["google", "yandex"]

    $("#listen").on("click", function(){
      recognizeWithAnnyang()
    })

    function trimAndLowerCaseText(text){
      return $.trim(text).toLowerCase()
    }

    function saveTranslation(shortcut){
      recentTranslation["shortcut"] = shortcut
      $.ajax({
        type: "POST",
        url: "/save_translation",
        data: recentTranslation,
        dataType: "json",
        success: function(data){
          responsiveVoice.speak("Saved the translation", "US English Female", parameters)
        }
      })
    }

    function translateInputText(){
      let trimmedInput = trimAndLowerCaseText($("#input").val())
      if(trimmedInput){
        dictateTranslation(trimmedInput, chosenLanguage, currentApi)
      }else{
        responsiveVoice.speak("No input text to translate.", "US English Female", parameters)
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
        $("label[for='recognition-language']").text("Recognition Language: " + trimmedLanguage)
        responsiveVoice.speak(("Recognition language set to " + trimmedLanguage), "US English Female", parameters)
      }else{
        responsiveVoice.speak("Language not supported.", "US English Female", parameters)
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
        $("label[for='translation-language']").text("Translation Language: " + trimmedLanguage)
        responsiveVoice.speak(("Translation language set to " + trimmedLanguage), "US English Female", parameters)
      }else{
        responsiveVoice.speak("Language not supported.", "US English Female", parameters)
      }
    }

    function setTranslator(translator){
      let trimmedTranslator = trimAndLowerCaseText(translator)
      if($.inArray(trimmedTranslator, lowerCaseTranslators) !== -1){
        let new_value = trimmedTranslator === "google" ? "google_translate" : "yandex_translate"
        currentApi = $("#translator").val() === "google_translate" ? "google_translate" : "yandex_translate"
        $("label[for='translator']").text("Translator: " + trimmedTranslator)
        responsiveVoice.speak(("Translator set to " + trimmedTranslator), "US English Female", parameters)
      }else{
        responsiveVoice.speak("Translator not supported.", "US English Female", parameters)
      }
    }

    function setRecentTranslation(originalText, translatedText, originalLanguage, translatedLanguage){
      recentTranslation["originalText"] = originalText
      recentTranslation["translatedText"] = translatedText
      recentTranslation["originalLanguage"] = originalLanguage
      recentTranslation["translatedLanguage"] = translatedLanguage
    }

    function dictateTranslation(text, selectedLanguage, api){
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
        success: function(data){
          if($.trim(data.translated_text).length){
            $("#untranslated-input").val(data.original_text)
            $("#translated-input").val(data.translated_text)

            setRecentTranslation(data.original_text, data.translated_text, data.source_language, data.destination_language)

            let voiceLanguage = "Spanish Female"

            if(chosenLanguage === "ja"){
              voiceLanguage = "Japanese Female"
            }else if(chosenLanguage === "en"){
              voiceLanguage = "US English Female"
            }

            responsiveVoice.speak(data.translated_text, voiceLanguage, parameters)
          }else{
            responsiveVoice.speak("No input provided", "US English Female", parameters)
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
          $("#listen").text("Currently Listening")
          $("#listen").toggleClass("btn-primary btn-danger")
          $("#listen").prop("disabled", true)
        })

        annyang.addCallback("end", function(){
          $("#listen").text("Listen")
          $("#listen").toggleClass("btn-primary btn-danger")
          $("#listen").prop("disabled", false)
        })

        annyang.setLanguage(recognizedLanguage)
        annyang.addCommands(commands)
        annyang.start({autoRestart: false, continuous: false})

      }else{
        responsiveVoice.speak("Annyang Recognition API not started", "US English Female", parameters)
      }
  }
  $(function(){
    if($("#translation-area").length){
      recognizeWithAnnyang()
    }
  })
})
