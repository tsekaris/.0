// eslint-disable-next-line
var os = {};

/*
Σε κάθε main.js πρέπει να μπαίνει:
window.onload = () => {
    //initial code:
    setInterval(() => {
    //cycle code:
    },0);
};
*/

os.html = function(db) {
  //db: {} Όλα τα properties

  //private variables
  //Key words: factory functions, closures
  //Προσπελάσιμες μόνο από εδώ.

  let _$0,
    _dom,
    _input,
    _msg,
    _fb = {},
    _visible,
    _external = {},
    _element = {
      get $0() {
        return _$0;
      },

      set $0(obj) {
        console.log("Το $0 δημιουργείτε μόνο μία φορά μέσα από την os.hmtl()");
      },

      set draw(db) {
        // db: {}, db: function, db: array
        if (Array.isArray(db)) {
          db.forEach(function(data) {
            _element.draw = data;
          });
        } else if (typeof db === "function") {
          db(_element);
        } else if (db !== undefined) {
          Object.keys(db).forEach(function(key) {
            if (key.charAt(0) === "$") {
              if (_element[key] === undefined) {
                db[key].$0 = _element;
                _element[key] = os.html(db[key]);
              } else {
                _element[key].draw = db[key];
              }
            } else {
              _element[key] = db[key];
            }
          });
        }
      },

      set update(db) {
        // Ένα υποσύνολο της draw. Κάνει μόνο update τις τιμές και δεν σχεδιάζει νέα πράγματα.
        // db: {}, db: function, db: array
        if (Array.isArray(db)) {
          db.forEach(function(data) {
            _element.update = data;
          });
        } else if (typeof db === "function") {
          db(_element);
        } else {
          Object.keys(db).forEach(function(key) {
            if (key.charAt(0) === "$") {
              _element[key].update = db[key];
            } else {
              _element[key] = db[key];
            }
          });
        }
      },

      get external() {
        return _external;
      },
      set external(db) {
        //db: {source: "test.svg", , ,}

        _external.source = db.source;
        delete db.source;
        switch (_external.source.split(".").pop()) {
          case "svg":
            fetch(_external.source)
              .then(response => response.text())
              .then(response => {
                _dom.innerHTML = response;
                var query = _dom.querySelectorAll("[id^='$']");
                for (let i of query) {
                  _element[i.id] = os.svg({
                    id: i.id
                  });
                }
                _element.draw = db;
              })
              .catch(console.log);
            break;
          case "md":
            fetch(_external.source)
              .then(response => response.text())
              .then(response => {
                _dom.innerHTML = marked(response);
                var strongs = [..._dom.getElementsByTagName("strong")];
                strongs.forEach(function(strong) {
                  var id = strong.textContent;
                  if (id.charAt(0) === "$") {
                    var _dbId = db[id];
                    if (_dbId !== undefined) {
                      delete db[id];
                    }
                    _element.draw = {
                      [id]: {
                        element: strong,
                        draw: _dbId
                      }
                    };
                  }
                });

                var imgs = [..._dom.getElementsByTagName("img")];

                imgs.forEach(function(img) {
                  //![$svg](svg/main.svg)
                  var src = img.src; //img.src: svg/main.svg
                  var alt = img.alt; //img.alt: $svg
                  if (src.split(".").pop() === "svg" && alt.charAt(0) === "$") {
                    var _dbAlt = db[alt];
                    if (_dbAlt !== undefined) {
                      delete db[alt];
                    }

                    _element.draw = {
                      [alt]: {
                        element: img.parentNode,
                        source: src,
                        draw: _dbAlt
                      }
                    };
                  }
                });
              })
              .catch(console.log);
            break;
          default:
            //color
            console.log("Not known source type");
        }
      },

      get dom() {
        return _dom;
      },
      set dom(db) {
        if (typeof db === "function") {
          db(_dom);
        } else {
          if (db.style !== undefined) {
            Object.keys(db.style).forEach(function(key) {
              _dom.style[key] = db.style[key];
            });
            delete db.style;
          }
          Object.keys(db).forEach(function(key) {
            _dom[key] = db[key];
          });
        }
      },

      set element(obj) {
        //obj: "p", obj: undefined (=) obj: "div", obj: selected dom
        let tag;
        if (_dom !== undefined) {
          _dom.remove();
        }

        if (obj === undefined) {
          tag = "div";
        } else if (typeof obj === "string") {
          tag = obj;
        } else {
          _dom = obj;
        }

        if (tag !== undefined) {
          _dom = document.createElement(tag);
          if (_$0 !== undefined) {
            _$0.dom.appendChild(_dom);
          } else {
            document.body.appendChild(_dom);
          }
        }
      },

      //classes
      get classes() {
        var arrayOfClasses = [];
        for (var i = 0, len = _dom.classList.length; i < len; i++) {
          arrayOfClasses[i] = _dom.classList.item(i);
        }
        return arrayOfClasses;
      },
      set classes(db) {
        if (Array.isArray(db)) {
          if (db.length === 0) {
            //delete all:
            _dom.className = "";
          } else {
            //_dom.classList.add(...db);
            db.forEach(function(value) {
              _dom.classList.add(value);
            });
          }
        } else if (typeof db === "string") {
          _dom.classList.add(db);
        } else {
          //db = {add: [], delete: []}
          if (db.delete !== undefined) {
            if (db.delete.length === 0) {
              //delete all:
              _dom.className = "";
            } else {
              db.delete.forEach(function(value) {
                _dom.classList.remove(value);
              });
              //_dom.classList.remove(...db.delete);
            }
          }
          if (db.add !== undefined) {
            db.add.forEach(function(value) {
              _dom.classList.add(value);
            });
            //_dom.classList.add(...db.add);
          }
        }
      },

      //visible
      get visible() {
        return !(_dom.style.display === "none");
      },
      set visible(value) {
        var visibility;
        if (value === "toggle") {
          visibility = _dom.style.display === "none";
        } else {
          visibility = value;
        }
        if (visibility) {
          _dom.style.display = _visible;
        } else {
          if (_dom.style.display !== "none") {
            _visible = _dom.style.display;
            _dom.style.display = "none";
          }
        }
      },

      //text. Μπορεί να αλλάξε στο input.
      get text() {
        return _dom.textContent;
      },
      set text(value) {
        _dom.textContent = value;
      },

      //text color
      get color() {
        return _dom.style.color;
      },
      set color(value) {
        _dom.style.color = value;
      },

      //fill
      get fill() {
        return _dom.style.backgroundColor;
      },
      set fill(value) {
        _dom.style.backgroundColor = value;
      },

      //borders
      //Πρέπει στο css: div {border: 1px hidden black;}
      //ορίζουμε το χρώμα

      get border() {
        if (_dom.style["border-style"] === "solid") {
          if (_dom.style["border-color"] === "") {
            return "black"; //δηλαδή αυτό που ορίζεται στο css. το default
          } else {
            return _dom.style["border-color"];
          }
        } else {
          return "";
        }
      },
      set border(value) {
        switch (value) {
          case true:
            _dom.style["border-style"] = "solid";
            break;
          case false:
            _dom.style["border-style"] = "";
            break;
          case "":
            _dom.style["border-style"] = "";
            break;
          case "toggle":
            if (_element.border === "") {
              _dom.style["border-style"] = "solid";
            } else {
              _dom.style["border-style"] = "";
            }
            break;
          default:
            //color
            _dom.style["border-style"] = "solid";
            _dom.style["border-color"] = value;
        }
      },

      get click() {
        return _dom.onclick;
      },
      set click(f) {
        _dom.onclick = f.bind(_element);
      },

      get input() {
        return _input;
      },

      set input(db) {
        if (_input === undefined) {
          _input = {
            _action: undefined,
            _clear: true,
            _editing: false,
            _text: _element.dom.textContent,
            get action() {
              return _input._action;
            },
            set action(f) {
              Object.defineProperty(_element, "text", {
                get: function() {
                  return _input._text;
                },
                set: function(value) {
                  // Αν είναι _element που έχει kids δεν πρέπει να χρησιμοποιείται γιατί θα σβήσει τα nested kids
                  // Υπάρχει δυνατότητα να έχει και kid και text αλλά αποκτάμε πολυπλοκότητα στην διαμόρφωση (fill κτλ)
                  // Keywords: firstChild.nodeValue, createTextNode
                  _input._text = value;
                  if (!_input._editing) {
                    _dom.textContent = _input._text;
                  }
                }
              });
              _input._action = f.bind(_element);
              _dom.contentEditable = true;
              _dom.onfocus = function() {
                _input._editing = true;
                if (_input._clear) {
                  _dom.textContent = "";
                }
              };
              _dom.onblur = function() {
                _input._editing = false;
                _element.text = _input._text;
              };
              _dom.onkeydown = function() {
                if (event.key === "Enter") {
                  event.preventDefault(); //Για να μην αλλάζει line
                  _input._action(_dom.textContent);
                  event.target.blur();
                }
              };
            },
            get clear() {
              return _input._clear;
            },
            set clear(value) {
              _input._clear = value;
            },
            get placeholder() {
              return _dom.dataset.placeholder;
            },
            set placeholder(value) {
              _dom.dataset.placeholder = value;
            }
          };
        }

        if (typeof db === "function") {
          _input.action = db;
        } else {
          for (i in db) {
            _input[i] = db[i];
          }
        }
      },

      get msg() {
        return _msg;
      },
      set msg(obj) {
        if (typeof obj === "function") {
          _msg = obj.bind(this);
        } else {
          _msg(obj);
        }
      },

      //fb: Εδώ μπαίνει ο κώδικας ο εξωτερικός. Ta function dεν πρέπει να είναι nested αν θέλουμε this -> _element.
      get fb() {
        return _fb;
      },
      set fb(db) {
        for (var i in db) {
          if (typeof db[i] === "function") {
            // this = _element
            _fb[i] = db[i].bind(_element);
          } else {
            _fb[i] = db[i];
          }
        }
      }
    };

  // parent memory
  if (db.$0 !== undefined) {
    _$0 = db.$0;
    delete db.$0;
  }

  //type of memory
  _element.element = db.element;
  if (db.element !== undefined) {
    delete db.element;
  }

  //external file
  if (db.source !== undefined) {
    _element.external = db;
  } else {
    _element.draw = db; //Σετάρισμα των υπόλοιπων properties
  }

  return _element;
};

os.svg2 = function(svgDom) {
  let data = {};
  let skeleton = function(elementDom, element) {
    let childrens = elementDom.querySelectorAll(":scope > [data-name]");
    childrens.forEach(function(children) {
      element[`$${children.dataset.name}`] = os.svg({ element: children });
      skeleton(children, element[`$${children.dataset.name}`]);
    });
  };
  skeleton(svgDom, data);
  return data;
};

os.svg = function(db) {
  //Το svg έχει ήδη τοποθετηθεί στην σελίδα
  let _dom;
  if (db.id !== undefined) {
    _dom = document.getElementById(db.id);
    delete db.id;
  } else if (db.element !== undefined) {
    _dom = db.element;
    delete db.element;
  }

  //Να μην διαλέγει το text κείμενο.
  _dom.style["user-select"] = "none";

  // για το border
  //var _border = _dom.style.stroke; //Για το toggle του border

  if (_dom.style.stroke === "none") {
    // Μερικές φορές δίνει "none" πχ path και text
    _dom.style.stroke = "";
    //_border = "";
  }

  _dom.dataset.stroke = _dom.style.stroke;

  //messaging function
  var _msg;

  // για εξωτερικό κώδικα
  var _fb = {};

  var _element = {
    set draw(db) {
      //'ιδια με το update
      _element.update = db;
    },

    set update(db) {
      // db: {}, db: function, db: array
      if (Array.isArray(db)) {
        for (var i = 0, len = db.length; i < len; i++) {
          (function(db) {
            for (var i in db) {
              _element[i] = db[i];
            }
          })(db[i]);
        }
      } else if (typeof db === "function") {
        db(_element);
      } else if (db !== undefined) {
        for (var i in db) {
          _element[i] = db[i];
        }
      }
    },

    get dom() {
      return _dom;
    },

    //visible
    get visible() {
      return !(_dom.style.display === "none");
    },
    set visible(value) {
      var visibility;
      if (value === "toggle") {
        visibility = _dom.style.display === "none";
      } else {
        visibility = value;
      }
      if (visibility) {
        _dom.style.display = _dom.dataset.styleDisplay;
      } else {
        if (_dom.style.display !== "none") {
          _dom.dataset.styleDisplay = _dom.style.display;
          _dom.style.display = "none";
        }
      }
    },

    //text
    get text() {
      return _dom.textContent;
    },
    set text(value) {
      _dom.textContent = value;
    },

    //text color
    get color() {
      return _dom.style.fill;
    },
    set color(value) {
      _dom.style.fill = value;
    },

    //fill
    get fill() {
      return _dom.style.fill;
    },
    set fill(value) {
      _dom.style.fill = value;
    },

    //border
    // Color: border = "color"
    // Hide: border = ""
    get border() {
      return _dom.style.stroke;
    },

    set border(value) {
      switch (value) {
        case true:
          //_dom.style.stroke = _border;
          _dom.style.stroke = _dom.dataset.stroke;
          break;
        case false:
          _dom.style.stroke = "";
          break;
        case "":
          _dom.style.stroke = "";
          break;
        case "toggle":
          if (_dom.style.stroke === "") {
            _dom.style.stroke = _dom.dataset.stroke;
          } else {
            _dom.style.stroke = "";
          }
          break;
        default:
          //color
          _dom.style.stroke = value;
          _dom.dataset.stroke = value;
        //_border = value;
      }
    },

    set click(f) {
      _dom.style.cursor = "pointer";
      _dom.onclick = f.bind(_element);
    },
    get click() {
      return _dom.onclick;
    },

    get msg() {
      return _msg;
    },
    set msg(obj) {
      if (typeof obj === "function") {
        _msg = obj.bind(this);
      } else {
        _msg(obj);
      }
    },

    get fb() {
      return _fb;
    },
    set fb(db) {
      for (var i in db) {
        // .bind(this);
        if (typeof db[i] === "function") {
          // this = _element
          _fb[i] = db[i].bind(_element);
        } else {
          _fb[i] = db[i];
        }
      }
    }
  };

  _element.update = db;
  return _element;
};

os.draw = function(db) {
  for (var i in db) {
    if (i.charAt(0) === "$") {
      if (window[i] === undefined) {
        //db[i].id = i;
        window[i] = os.html(db[i]);
      } else {
        window[i].draw = db[i];
      }
    }
  }
};

os.templates = {};

os.templates.buttonsFB = function(labels) {
  //labels: ["start", "stop", "ready"]

  return function(div) {
    div.draw = {
      visible: false,
      classes: "buttons-wrapper"
    };
    for (var i = 0, len = labels.length; i < len; i++) {
      div.draw = {
        ["$" + labels[i]]: {
          classes: "buttons-button",
          text: labels[i],
          click: function() {
            div.msg = this.text; // Άρα πρέπει να ορίσω msg για το div που περιέχει τα buttons
          }
        }
      };
    }
  };
};

os.templates.keypadFB = function() {
  return function(div) {
    var keyNumber = {
      classes: "keypad-button",
      click: function() {
        if (
          !(
            div.$terminal.text.charAt(0) === "0" &&
            div.$terminal.text.length === 1
          )
        ) {
          div.$terminal.text = div.$terminal.text + this.text;
        } else {
          div.$terminal.text = this.text;
        }
      }
    };

    div.draw = {
      visible: false,
      classes: "keypad-wrapper",
      $terminal: {
        text: "",
        classes: "keypad-terminal"
      },
      $key1: {
        draw: keyNumber,
        text: "1"
      },
      $key2: {
        draw: keyNumber,
        text: "2"
      },
      $key3: {
        draw: keyNumber,
        text: "3"
      },
      $keyEsc: {
        classes: "keypad-button",
        text: "esc",
        click: function() {
          div.$terminal.text = "";
          div.visible = false;
        }
      },
      $key4: {
        draw: keyNumber,
        text: "4"
      },
      $key5: {
        draw: keyNumber,
        text: "5"
      },
      $key6: {
        draw: keyNumber,
        text: "6"
      },
      $keyClear: {
        classes: "keypad-button",
        text: "clear",
        click: function() {
          div.$terminal.text = "";
        }
      },
      $key7: {
        draw: keyNumber,
        text: "7"
      },
      $key8: {
        draw: keyNumber,
        text: "8"
      },
      $key9: {
        draw: keyNumber,
        text: "9"
      },
      $keyDel: {
        classes: "keypad-button",
        text: "del",
        click: function() {
          var length = div.$terminal.text.length;
          if (length !== 0) {
            div.$terminal.text = div.$terminal.text.slice(0, length - 1);
          }
        }
      },
      $keyComma: {
        classes: "keypad-button",
        text: ".",
        click: function() {
          if (div.$terminal.text.indexOf(".") === -1) {
            if (div.$terminal.text.length === 0) {
              div.$terminal.text = "0." + div.$terminal.text;
            } else {
              div.$terminal.text = div.$terminal.text + ".";
            }
          }
        }
      },
      $key0: {
        draw: keyNumber,
        text: "0"
      },
      $keyMinus: {
        classes: "keypad-button",
        text: "-",
        click: function() {
          if (div.$terminal.text.charAt(0) !== "-") {
            div.$terminal.text = "-" + div.$terminal.text;
            this.text = "+";
          } else {
            div.$terminal.text = div.$terminal.text.replace("-", "");
            this.text = "-";
          }
        }
      },
      $keyEnter: {
        classes: "keypad-button",
        text: "enter",
        click: function() {
          var text = div.$terminal.text;
          if (text) {
            text = Number(text);
            if (!isNaN(text)) {
              div.msg = text;
            }
          }
          div.$terminal.text = "";
        }
      }
    };
  };
};

os.templates.pairFB = function(db) {
  //db: {description: "text", buttons: ["label1", "label2"] or keypad: true}
  return function(div) {
    var _fFB;

    if (db.keypad) {
      _fFB = os.templates.keypadFB();
    } else if (db.buttons) {
      _fFB = os.templates.buttonsFB(db.buttons);
    }

    div.draw = {
      classes: "pair-wrapper",
      $description: {
        classes: "pair-description",
        text: db.description
      },
      $value: {
        text: "?"
      }
    };

    if (_fFB !== undefined) {
      div.draw = {
        $input: {
          draw: _fFB,
          msg: function(msg) {
            div.$value.text = msg;
          }
        },
        $value: {
          classes: "pair-value-button",
          click: function() {
            div.$input.visible = "toggle";
          }
        }
      };
    } else {
      div.$value.classes = "pair-value";
    }
  };
};

os.Mqtt = function(db) {
  //db = {address: "10.0.0.1:8000", topics: ["topic1", "/topic/#"]}
  this.address = db.address;
  this.topics = db.topics;

  this.client = new Paho.MQTT.Client(
    "ws://" + this.address + "/ws",
    "browser" + new Date().getTime()
  );

  this.connect = () => {
    this.client.connect({
      onSuccess: () => {
        for (var i = 0; i < this.topics.length; i++) {
          this.client.subscribe(this.topics[i]);
        }
        console.log("Connected on" + this.address + ".");
      }
    });
  };

  this.client.onConnectionLost = response => {
    if (response.errorCode !== 0) {
      console.log(
        "Connection lost on: " + this.address + "." + response.errorMessage
      );
      this.connect();
    }
  };

  //read:
  this.onMsgFor = {};
  //1 function για κάθε topic
  this.client.onMessageArrived = message => {
    //Αν είναι weintek: {d: {id: 0, tag1: 23, tag2: 56, tag3: [45, 40, 36]}, ts: xxxxx}
    var data = JSON.parse(message.payloadString);
    this.onMsgFor[message.destinationName](data);
  };

  //write:
  this.send = (topic, db) => {
    //Αν είναι weintek db = {d : {id: 12, value: 45}}
    var message = new Paho.MQTT.Message(JSON.stringify(db));
    message.destinationName = topic;
    //topic. Μόνο ένα για το write
    //message.retained = true;
    this.client.send(message);
  };

  this.connect();
};
