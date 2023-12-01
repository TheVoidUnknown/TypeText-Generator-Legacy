// TypeText generator v1.41 LEGACY by VoidUnknown
// Please report bugs to @thevoidunknown via discord
/* 

  Note:
  <br> tags are supported, and will create an appropriate line break in text.
  <p> tags will create a pause for x seconds, E.G. <p0.5> will pause for 0.5 seconds.
  <shake> tags will make text inside shake, E.G. <shake0.2>beans</shake> will make only "beans" shake. 0.2 is the intensity.

*/

let params = {
  "prefabName": "Epic Monologue", // The name of the prefab
  "text": "<shake0.2>I've come to kill you nano!</shake>", // Text to "type" out
  "letter_space": 1.75, // Spacing between letters, 1.75 is best for default font.
  "line_space": 3, // Spacing between lines when <br> is used
  "letter_delay": 1, // How long it takes to finish "typing" the text, in seconds. Does not include <p> tags.
  "obj_depth": 20, // Render depth of all the objects
  "obj_color": 0, // Color of the objects, 0 is the leftmost color of the theme
  "colorEase": 3, // The color to ease from when the letter spawns
  "lifetime": 3, // How many seconds to live after text is done
  "obj_layer": 1, // Doesn't matter, is only used for filler.
  "font": ["Inconsolata", "MajorMonoDisplay", "Hellovetica", "PoorStory"][0], // Font to use, 0 is default font. Disabled on legacy.
  "extraTags": "",// Extra HTML tags to use on the text, such as <b> or <i>
  "cursor": "", //"█" // Optional, is placed in front of each letter to sell the illusion of typing in a terminal
  "easeTime": 0.5, // The time it takes each letter to ease
  "easeType": "popup", // The "fashion" in which letters appear



  // Here be dragons! Dont use these params unless you know what you're doing!
  "obj_startPos": 0, // When the object spawns relative to the prefab. Not very useful to mess with.
  "obj_bin": 1, // Starting bin for each letter
  "obj_interval": 0.00, // How much to increment parent offset per letter. Not yet supported in Legacy.
}


// Define a bunch of stuff in global scope
// TODO: Text Alignment
// TODO: migrate to regex
let parentOffset = 0
let objects = []
let obj_line = 0
let letters = params.text.split("")
let id
let prefab_padding_start
let ii = 0
let skipObjectPush = false
let parsedTimerTag
let shakeTime = 0
let events
let underlineSpawnTime
let underlineLength
let underlineSpawnPos
let fx = {
  "bold": false,
  "italic": false,
  "underline": false, 
  "strikethrough": false,
  "shake": false,
  "shakeIntensity": 0.3,
  "shakeSpeed": 0.1,
  "alpha": 100
}

function shuffle(array) { // Totally not stolen from StackOverflow
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    } 
    return array;
}


let parent_id = shuffle("#▆¾hR:W:✿p<<%n¾@".split("")).join("") // dont even think about complaining.

function makeObject(pid,char,pos,color,depth,startPos,offset,letterfont,line) { // Function to fill out the template with relevant info
  let id = shuffle(pid.split("")).join("") // Create a new ID, pray to RNJesus that it doesnt make a duplicate ID
  let keyframes = {"move":[],"scale":[],"rotation":[],"color":[]}
  let startKeyframes = {"move":[],"scale":[],"rotation":[],"color":[]}
  let pos_y = 0-(line*params.line_space)

    if (params.easeType == "flutter") {
      // Ease in
      startKeyframes["scale"].push(makeDoubleStartKeyframe(0,2.0,"Linear"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.easeTime}`,2.0,2.0,"OutElastic"))
      keyframes["color"].push(makeSingleKeyframe(`${params.easeTime}`,color,"OutSine"))

      // Ease out
      keyframes["scale"].push(makeDoubleKeyframe(`${params.lifetime}`,2.0,2.0,"Linear"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.lifetime+params.easeTime}`,0,2.0,"InElastic"))
    }

    if (params.easeType == "flutter-stack") {
      // Ease in
      startKeyframes["move"].push(makeDoubleStartKeyframe((pos-params.letter_space),pos_y,"Linear"))
      startKeyframes["scale"].push(makeDoubleStartKeyframe(0,2.0,"Linear"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.easeTime}`,2.0,2.0,"OutElastic"))
      keyframes["move"].push(makeDoubleKeyframe(`${params.easeTime}`,pos,pos_y,"OutCirc"))
      keyframes["color"].push(makeSingleKeyframe(`${params.easeTime}`,color,"OutSine"))

      // Ease out
      keyframes["scale"].push(makeDoubleKeyframe(`${params.lifetime}`,2.0,2.0,"OutElastic"))
      keyframes["move"].push(makeDoubleKeyframe(`${params.lifetime}`,pos,pos_y,"OutCirc"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.lifetime+params.easeTime}`,0,2.0,"InElastic"))
      keyframes["move"].push(makeDoubleKeyframe(`${params.lifetime+params.easeTime}`,pos-params.letter_space,pos_y,"InCirc"))
    }

    if (params.easeType == "popup") {
      // Ease in
      startKeyframes["move"].push(makeDoubleStartKeyframe(pos,pos_y-(params.line_space/2),"Linear"))
      startKeyframes["scale"].push(makeDoubleStartKeyframe(2.0,0,"Linear"))
      keyframes["move"].push(makeDoubleKeyframe(`${params.easeTime}`,pos,pos_y,"OutCirc"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.easeTime}`,2.0,2.0,"OutCirc"))
      keyframes["color"].push(makeSingleKeyframe(`${params.easeTime}`,color,"OutSine"))

      // Ease out
      keyframes["move"].push(makeDoubleKeyframe(`${params.lifetime}`,pos,pos_y,"OutCirc"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.lifetime}`,2.0,2.0,"OutCirc"))
      keyframes["move"].push(makeDoubleKeyframe(`${params.lifetime+params.easeTime}`,pos,pos_y-(params.line_space/2),"InCirc"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.lifetime+params.easeTime}`,2.0,0,"InCirc"))
    }

    if (params.easeType == "zipper") {
      // Ease in
      if (ii % 2 == 0) {
        startKeyframes["move"].push(makeDoubleStartKeyframe(pos,pos_y-(params.line_space/2),"Linear"))
      } else {
        startKeyframes["move"].push(makeDoubleStartKeyframe(pos,pos_y+(params.line_space/2),"Linear"))
      }
      startKeyframes["scale"].push(makeDoubleStartKeyframe(2.0,0,"Linear"))
      keyframes["move"].push(makeDoubleKeyframe(`${params.easeTime}`,pos,pos_y,"OutCirc"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.easeTime}`,2.0,2.0,"OutCirc"))
      keyframes["color"].push(makeSingleKeyframe(`${params.easeTime}`,color,"OutSine"))

      // Ease out
      startKeyframes["move"].push(makeDoubleKeyframe(`${params.lifetime}`,pos,pos_y,"InCirc"))
      startKeyframes["move"].push(makeDoubleKeyframe(`${params.lifetime+params.easeTime}`,pos,pos_y-(params.line_space/2),"InCirc"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.lifetime}`,2.0,2.0,"InCirc"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.lifetime+params.easeTime}`,2.0,0,"InCirc"))
    }

    if (params.easeType == "smooth") {
      // Ease in
      startKeyframes["scale"].push(makeDoubleStartKeyframe(0,2.0,"Linear"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.easeTime}`,2.0,2.0,"OutCirc"))
      keyframes["color"].push(makeSingleKeyframe(`${params.easeTime}`,color,"OutSine"))

      // Ease out
      keyframes["scale"].push(makeDoubleKeyframe(`${params.lifetime}`,2.0,2.0,"OutCirc"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.lifetime+params.easeTime}`,0,2.0,"InCirc"))
    }

    if (params.easeType == "bounce") {
      // Ease in
      startKeyframes["color"].push(makeSingleStartKeyframe(params.colorEase,"Linear"))
      startKeyframes["scale"].push(makeDoubleStartKeyframe(2.0,0,"Linear"))
      startKeyframes["move"].push(makeDoubleStartKeyframe(pos,pos_y-(params.line_space/2),"Linear"))
      startKeyframes["rotation"].push(makeSingleStartKeyframe(0,"Linear"))
      keyframes["color"].push(makeSingleKeyframe(`${params.easeTime/2}`,color,"OutSine"))
      keyframes["rotation"].push(makeSingleKeyframe(`${params.easeTime/20}`,-30,"OutSine"))
      keyframes["rotation"].push(makeSingleKeyframe(`${params.easeTime}`,30,"OutElastic"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.easeTime}`,2.0,2.0,"OutElastic"))
      keyframes["move"].push(makeDoubleKeyframe(`${params.easeTime}`,pos,pos_y,"OutElastic"))

      // Ease out
      keyframes["scale"].push(makeDoubleKeyframe(`${params.lifetime}`,2.0,2.0,"OutElastic"))
      keyframes["move"].push(makeDoubleKeyframe(`${params.lifetime}`,pos,pos_y,"OutElastic"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.lifetime+params.easeTime}`,2.0,0,"InBack"))
      keyframes["move"].push(makeDoubleKeyframe(`${params.lifetime+params.easeTime}`,pos,pos_y-(params.line_space/2),"InBack"))
    }

    if (params.easeType == "stretch") {
      // Ease in
      startKeyframes["scale"].push(makeDoubleStartKeyframe(3,0,"Linear"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.easeTime}`,2.0,2.0,"OutElastic"))
      keyframes["color"].push(makeSingleKeyframe(`${params.easeTime}`,color,"InOutSine"))

      // Ease out
      keyframes["scale"].push(makeDoubleKeyframe(`${params.lifetime}`,2.0,2.0,"OutElastic"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.lifetime+params.easeTime}`,3.0,0,"InBack"))
    }

    if (params.easeType == "elastic") {
      // Ease in
      startKeyframes["scale"].push(makeDoubleStartKeyframe(2.0,0,"Linear"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.easeTime}`,2.0,2.0,"OutBack"))
      keyframes["color"].push(makeSingleKeyframe(`${params.easeTime}`,color,"OutSine"))

      // Ease out
      keyframes["scale"].push(makeDoubleKeyframe(`${params.lifetime}`,2.0,2.0,"OutBack"))
      keyframes["scale"].push(makeDoubleKeyframe(`${params.lifetime+params.easeTime}`,2.0,0,"InBack"))
    }

    if (params.easeType == "custom") {
      // Please only use this if you know what you're doing
      startKeyframes["color"].push(makeSingleStartKeyframe(params.colorEase,"Linear"))
      startKeyframes["scale"].push(makeDoubleStartKeyframe(2.0,2.0,"Linear"))
      keyframes["color"].push(makeSingleKeyframe(`${params.easeTime}`,color,"InElastic"))
    }



    if (fx.shake) {
      keyframes["move"] = []
      for (shakeTime=fx.shakeSpeed;shakeTime<params.lifetime;shakeTime+=fx.shakeSpeed) {
        keyframes["move"].push(makeRandomKeyframe(shakeTime,(pos+fx.shakeIntensity),(pos_y+fx.shakeIntensity),(pos+(0-fx.shakeIntensity)),(pos_y+(0-fx.shakeIntensity)),1,"OutElastic"));
      }
    }

  // Fill missing keyframes with defaults, to prevent invalid objects
  // I know it could be more efficient i dont care
  if (startKeyframes["move"].length == 0) {startKeyframes["move"].push(makeDoubleStartKeyframe(pos,pos_y,"Linear"))}
  if (startKeyframes["scale"].length == 0) {startKeyframes["scale"].push(makeDoubleStartKeyframe(2.0,2.0,"Linear"))}
  if (startKeyframes["rotation"].length == 0) {startKeyframes["rotation"].push(makeSingleStartKeyframe(0,"Linear"))}
  if (startKeyframes["color"].length == 0) {startKeyframes["color"].push(makeSingleStartKeyframe(params.colorEase,"Linear"))}

  let appliedTags = ""
  if (fx.bold) {appliedTags=appliedTags+"<b>"}
  if (fx.italic) {appliedTags=appliedTags+"<i>"}
  
  return {
    "id":id,
    "p":pid,
    "akt":2,
    "ako":params.lifetime,
    "ot":2,
    "n":`Text ${char}`,
    "text":`${appliedTags}${char}`,
    "o":{"x":"-0.5","y":"0.0"},
    "shape":4,
    "d":depth,
    "st":startPos,
    "pt":"111",
    "ed":{
      "bin":params.obj_bin,
      "shrink":"True",
      "layer":5
    },
    "events":{
      "pos":[...startKeyframes["move"],...keyframes["move"]],
      "sca":[...startKeyframes["scale"],...keyframes["scale"]],
      "rot":[...startKeyframes["rotation"],...keyframes["rotation"]],
      "col":[...startKeyframes["color"],...keyframes["color"]]
    }
    //"p_o": [offset, offset, offset],
  }
}



function makeDoubleStartKeyframe(x,y,ease) { // Return keyframe with two values and no start time
  return {"t":0,"x":x,"y":y}
}

function makeDoubleKeyframe(time,x,y,ease) { // Return keyframe with two values
  return {"t":time,"ct":ease,"x":x,"y":y}
}

function makeSingleStartKeyframe(x,ease) { // Return keyframe with a single value and no start time
  return {"t":0,"x":x}
}

function makeSingleKeyframe(time,x,ease) { // Return keyframe with a single value 
  return {"t":time,"ct":ease,"x":x}
}

function makeRandomKeyframe(time,x,y,x2,y2,type,ease) {
  return {"t":time,"ct":ease,"x":x,"y":y, "r":type,"rx":x2,"rz":y2}
}

function makeCursor(pid,pos,color,depth,startPos,cursorChar) { // Define function to generate "cursor"
  let keyframes = []
  cursorTime = 0
  cursorX = 0
  for (i=0; i<(params.text.length+1); i++) {
    keyframes.push(makeDoubleKeyframe(cursorTime,cursorX,0,"Instant"))
    cursorTime += (params.letter_delay/params.text.length)
    cursorX += params.letter_space
  }
  keyframes.join("")
  id = shuffle(pid.split("")).join("")
  return {
    "id":id,
    "p_id":pid,
    "ak_t":2,
    "ak_o":params.lifetime,
    "ot":2,
    "n":"Text Cursor",
    "text":cursorChar,
    "o":{"x":-0.5,"y":0.0},
    "s":4,
    "ed":{
      "b":params.obj_bin+1,
      "co":true,
      "l":5
    },
    "e":[
      {"k":[{"ct":"Linear","ev":[0.0,0.0]},...keyframes]},
      {
        "k":[
          {"ct":"Linear","ev":[params.letter_space/2,params.line_space/2]},
          {"ct":"Instant","t":cursorTime+(params.letter_delay/params.text.length),"ev":[0.0,0.0]}
        ]
      },
      {"k":[{"ct":"Linear","ev":[0.0]}]},
      {"k":[{"ct":"Linear","ev":[color]}]}
    ],
    "p_t":"111",
    "p_o": [0,0,0],
    "d":depth,
    "st":startPos
  }
} // Does not work well when text is actively moving

function makeUnderline(pid,spawnTime,length,spawnPosition,line,endTime,thickness) {
  let keyframes = {"move":[],"scale":[],"rotation":[],"color":[]}
  let startKeyframes = {"move":[],"scale":[],"rotation":[],"color":[]}
  endTime += (params.easeTime/2)
  endTime = endTime - spawnTime
  line = 0-((line+(thickness*2))*params.line_space)

  startKeyframes["move"].push(makeDoubleStartKeyframe(spawnPosition,line,"Linear"))
  startKeyframes["scale"].push(makeDoubleStartKeyframe(0,thickness,"Linear"))
  startKeyframes["rotation"].push(makeSingleStartKeyframe(0,"Linear"))
  startKeyframes["color"].push(makeSingleStartKeyframe(params.colorEase,"Linear"))
  keyframes["move"].push(makeDoubleKeyframe(`${endTime}`,spawnPosition,line,"Instant"))
  keyframes["scale"].push(makeDoubleKeyframe(`${endTime}`,length,thickness,"InOutSine"))
  keyframes["rotation"].push(makeSingleKeyframe(`${endTime}`,0,"Instant"))
  keyframes["color"].push(makeSingleKeyframe(`${endTime}`,params.obj_color,"OutSine"))

  id = shuffle(pid.split("")).join("")

  return {
    "id":id,
    "p":parent_id,
    "akt":2,
    "ako":params.lifetime,
    "ot":2,
    "n":`Text Underline`,
    "o":{"x":"-0.5","y":"0.0"},
    "d":params.obj_depth,
    "st":spawnTime,
    "pt":"111",
    "ed":{
      "bin":params.obj_bin+1,
      "shrink":"True",
      "layer":5
    },
    "events":{
      "pos":[...startKeyframes["move"],...keyframes["move"]],
      "sca":[...startKeyframes["scale"],...keyframes["scale"]],
      "rot":[...startKeyframes["rotation"],...keyframes["rotation"]],
      "col":[...startKeyframes["color"],...keyframes["color"]]
    }
    //"p_o": [offset, offset, offset],
  }
}

function makeStrikethrough(pid,spawnTime,length,spawnPosition,line,endTime,thickness) {
  let keyframes = {"move":[],"scale":[],"rotation":[],"color":[]}
  let startKeyframes = {"move":[],"scale":[],"rotation":[],"color":[]}
  endTime += (params.easeTime/2)
  endTime = endTime - spawnTime
  line = (0-(line*params.line_space))-(thickness/2)

  startKeyframes["move"].push(makeDoubleStartKeyframe(spawnPosition,line,"Linear"))
  startKeyframes["scale"].push(makeDoubleStartKeyframe(0,thickness,"Linear"))
  startKeyframes["rotation"].push(makeSingleStartKeyframe(0,"Linear"))
  startKeyframes["color"].push(makeSingleStartKeyframe(params.colorEase,"Linear"))
  keyframes["move"].push(makeDoubleKeyframe(`${endTime}`,spawnPosition,line,"Instant"))
  keyframes["scale"].push(makeDoubleKeyframe(`${endTime}`,length,thickness,"InOutSine"))
  keyframes["rotation"].push(makeSingleKeyframe(`${endTime}`,0,"Instant"))
  keyframes["color"].push(makeSingleKeyframe(`${endTime}`,params.obj_color,"OutSine"))

  id = shuffle(pid.split("")).join("")

  return {
    "id":id,
    "p":parent_id,
    "akt":2,
    "ako":params.lifetime,
    "ot":2,
    "n":`Text Strikethrough`,
    "o":{"x":"-0.5","y":"0.0"},
    "d":params.obj_depth,
    "st":spawnTime,
    "pt":"111",
    "ed":{
      "bin":params.obj_bin+1,
      "shrink":"True",
      "layer":5
    },
    "events":{
      "pos":[...startKeyframes["move"],...keyframes["move"]],
      "sca":[...startKeyframes["scale"],...keyframes["scale"]],
      "rot":[...startKeyframes["rotation"],...keyframes["rotation"]],
      "col":[...startKeyframes["color"],...keyframes["color"]]
    }
    //"p_o": [offset, offset, offset],
  }
}

function generatePrefab() {
let obj_pos = 0 // Start text 0 units away from parent
let spawnPos = 0 // Start 0 seconds away from prefab spawn
let a = 0
let text = params.text.split('')
let result = ""
parentOffset = 0
objects = []
obj_line = 0
letters = params.text.split("")
ii = 0
skipObjectPush = false
shakeTime = 0

for (i=0; i<params.text.length; i++) { // For 0 to n letters

  let letter = letters[i]
  console.info(`Letter ${i+1} of ${params.text.length} parsing. Current Char: ${letters[i]}`) // Print Character
  ii = ii + 1 // Increment i
  if (letter == " ") {obj_pos += params.letter_space;skipObjectPush = true;} // Skip if character is whitespace

  if (fx.underline || fx.strikethrough) {underlineLength+=params.letter_space} // Increment underline length if active

  for (a=0;a<text.length;a++) { // Iterate through letters

    tag = ""
    if (text[i] == "<" && !(text[i-1] == "\\")) { // if < is found without escape character \
      i++ // dont capture the <
      skipObjectPush = true

      while (text[i] != ">") { // iterate until >
        tag += text[i] // grab data inbetween
        i++
        if (i > 9999) {throw new Error('Tag doesn\'t have a closing bracket!')}
      }
      console.log(`Tag captured: <${tag}>`)

      if (/p/.test(tag)) {// If <p> tag, insert delay
        spawnPos += parseFloat(tag.replaceAll('p',''))
        obj_pos += params.letter_space
        break;
      }


      if (/br/.test(tag)) {// If <br> tag, insert line break
        obj_pos = 0
        obj_line += 1
        break;
      }


      if (/b/.test(tag)) {// If <b> tag, set bold true
        fx.bold = true
        break;
      }

      if (/\/b/.test(tag)) {// If </b> tag, set bold false
        fx.bold = false
        break;
      }


      if (/i/.test(tag)) {// If <i> tag, set italic true
        fx.italic = true
        break;
      }

      if (/\/i/.test(tag)) {// If </i> tag, set italic false
        fx.italic = false
        break;
      }


      if (/shake/.test(tag)) {// If <shake> tag, set shake true
        fx.shakeIntensity = parseFloat(tag.replaceAll('shake',''))
        fx.shake = true
        break;
      }

      if (/\/shake/.test(tag)) {// If </shake> tag, set shake false
        fx.shake = false
        break;
      }

      
      if (/\/u/.test(tag)) {// If </u> tag, set underline false and create the underline
        fx.underline = false
        underlineLength -= params.letter_space
        objects.push(makeUnderline(parent_id,underlineSpawnTime,underlineLength,underlineSpawnPos,obj_line,spawnPos,0.3))
        underlineLength = 0
        underlineSpawnTime = 0
        underlineSpawnPos = 0
        break;
      }

      if (/u/.test(tag)) {// If <u> tag, set underline true
        fx.underline = true
        underlineLength = 0
        underlineSpawnTime = spawnPos
        underlineSpawnPos = obj_pos
        break;
      }


      if (/\/s/.test(tag)) {// If </s> tag, set strikethrough false and create the strikethrough
        fx.strikethrough = false
        underlineLength -= params.letter_space
        objects.push(makeStrikethrough(parent_id,underlineSpawnTime,underlineLength,underlineSpawnPos,obj_line,spawnPos,0.3))
        underlineLength = 0
        underlineSpawnTime = 0
        underlineSpawnPos = 0
        break;
      }

      if (/s/.test(tag)) {// If <s> tag, set strikethrough true
        fx.strikethrough = true
        underlineLength = 0
        underlineSpawnTime = spawnPos
        underlineSpawnPos = obj_pos
        break;
      }
    }
  }

  if (skipObjectPush) { // If statement to skip pushing an object
    skipObjectPush=false
    console.info("Push Skipped")
  } else {
    objects.push(makeObject(parent_id,letter,obj_pos,params.obj_color,params.obj_depth,spawnPos,parentOffset,params.font,obj_line))
    obj_pos += params.letter_space
    spawnPos += (params.letter_delay/params.text.length)
    parentOffset += params.obj_interval
    result += letter
  }

}

prefab = {
  "name": params.prefabName,
  "type": "7",
  "id": shuffle("#▆¾hR:W:✿p<<%n¾@".split("")).join(""),
  "offset": "0",
  "objects": []
}

if (params.cursor != ""){objects.push(makeCursor(parent_id,0,params.obj_color,params.obj_depth,0,params.cursor))}

// Spit out the prefab
objects.unshift({
  "id":parent_id,
  "akt":2,
  "ako":1.0,
  "ot":3,
  "n":"Text Parent",
  "ed":{"layer":5},
  "events":{
    "pos":[{"t":0,"x":0,"y":0}],
    "sca":[{"t":0,"x":1,"y":1}],
    "rot":[{"t":0,"x":0}],
    "col":[{"t":0,"x":0}]
  },
  "pt":"101",
  "d":20
  })
prefab.objects = (objects)
return JSON.stringify(prefab)
}

//copy(generatePrefab(params));
