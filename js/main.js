/* jshint strict: false */
/*global RiTa, RiString, RiGrammar, RiMarkov, $*/

var contentMarkov = new RiMarkov(4);
var chapterMin = 3;
var chapterMax = 6;
var referencesLength;

function generateTitle(grammar) {
    var titleContent = new RiGrammar(grammar).expandFrom('<title>');
    $('#title').text(titleContent);
}

function generateAbstract(grammar) {
    var abstractContent = new RiGrammar(grammar).expandFrom('<abstract>');
    $('#abstract').text(abstractContent);
}

// Generate the headers. Take 2-6 tokens, make them lowercase.
// Replace special characters with a space and then make the first char uppercase.
// Append to content.
function generateHeading() {
    var heading = contentMarkov.generateTokens(RiTa.random(2, 6));
    var stringHeading = heading.join(" ").toLowerCase();
    stringHeading = stringHeading.replace(/[^a-zA-Z\d\s]/g, " ");
    stringHeading = stringHeading.charAt(0).toUpperCase() + stringHeading.slice(1);
    return stringHeading;
}

function generateReference() {
    return " [" + (Math.floor(Math.random() * referencesLength) + 1) + "].";
}

function generateSentences(min, max) {
    var sentences = contentMarkov.generateSentences(RiTa.random(min, max));
    for (var i = 0; i < sentences.length; i++) {
        if (Math.random() > 0.5)  {
            var reference = generateReference();
            sentences[i] = sentences[i].replace(".", reference);
        }
    }
    return sentences;
}

function generateChapter(heading, sentences) {
    $('#content').append("<h2>" + heading + "</h2>");
    $('#content').append("<p>" + sentences.join(" ") + "</p>");
}

function generateContent(str) {
    contentMarkov.loadText(str);
    if (contentMarkov.ready()) {
        var chapterNum = RiTa.random(chapterMin, chapterMax);
        for (var i = 0; i <= chapterNum; i++) {
            var heading;
            var sentences;
            if (i === 0) {
                heading = "Introduction";
            } else {
                heading = generateHeading();
            }
            sentences = generateSentences(5, 15);
            generateChapter(heading, sentences);
        }
    }
}

function generateReferences(references) {
    var lines = references.split('\n'); // Split at new lines
    var uniqueLines = lines.filter(function (elem, pos) { // Remove duplicates,
       return lines.indexOf(elem) == pos;                 // only works if the lines are exact duplicates.
    });
    uniqueLines.sort(); // Sort into alphabetical order
    referencesLength = uniqueLines.length; // used in in-text citations
    $.each(uniqueLines, function (index, value) {
        var citationNumber = index + 1;
        $('#references').append("<p>" + citationNumber + ". " + value + "</p>"); // Write each reference with numbering
    });
}

function loadText() {

    // Load references
    $.get('corpus/references.txt', function (references) {
        if (references !== null) {
            generateReferences(references);
        } else {
            $('#references').text("References!");
        }
    });

    // Load main text
    // This is done with RiTa so we get a nice
    // corpus to play with
    RiTa.loadString("corpus/corpus.txt", function (corpus) {
        if (corpus !== null) {
            generateContent(corpus);
        } else {
            $('#content').text("Corpus unavailable!");
        }
    });

    // Load grammar for title and abstract
    $.getJSON("corpus/grammar.json", function (grammar) {
        if (grammar !== null) {
            generateTitle(grammar);
            generateAbstract(grammar);
        } else {
            $('#title').text("Grammar unavailable!");
        }
    });
}
