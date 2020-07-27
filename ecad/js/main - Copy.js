//eslint-disable-next-line

var supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;

/* css
var style = document.createElement('style');
document.head.appendChild(style);
style.sheet.insertRule('div {background-color: white;color: black; border: 0px solid black; padding: 0px; margin: 0px;}');
*/

var myText = `
# ΠΑΟΚ
Με τους Δημήτρη Γιαννούλη και Κάρολ Σφιντέρσκι. **$1**.
`

var myText2 =`
Modal/Dialog Box
Finally, a modal or dialog box is a message box that allows further interactivity of the page without navigating away from the current content in the browser. A modal box is not locked to the screen (i.e., the client can navigate away from it without a required interaction), though it is typically the user’s focus (based on your styling of the box). In most instances, if a user wants to dismiss the modal, they can simply close the box with a provided button, or click outside of the modal. An example of a modal is when a user needs to complete a form or provide specific information for a search query, but you don’t want them to navigate to another page.
Modal/Dialog Box
Finally, a modal or dialog box is a message box that allows further interactivity of the page without navigating away from the current content in the browser. A modal box is not locked to the screen (i.e., the client can navigate away from it without a required interaction), though it is typically the user’s focus (based on your styling of the box). In most instances, if a user wants to dismiss the modal, they can simply close the box with a provided button, or click outside of the modal. An example of a modal is when a user needs to complete a form or provide specific information for a search query, but you don’t want them to navigate to another page.
Modal/Dialog Box
Finally, a modal or dialog box is a message box that allows further interactivity of the page without navigating away from the current content in the browser. A modal box is not locked to the screen (i.e., the client can navigate away from it without a required interaction), though it is typically the user’s focus (based on your styling of the box). In most instances, if a user wants to dismiss the modal, they can simply close the box with a provided button, or click outside of the modal. An example of a modal is when a user needs to complete a form or provide specific information for a search query, but you don’t want them to navigate to another page.
Modal/Dialog Box
Finally, a modal or dialog box is a message box that allows further interactivity of the page without navigating away from the current content in the browser. A modal box is not locked to the screen (i.e., the client can navigate away from it without a required interaction), though it is typically the user’s focus (based on your styling of the box). In most instances, if a user wants to dismiss the modal, they can simply close the box with a provided button, or click outside of the modal. An example of a modal is when a user needs to complete a form or provide specific information for a search query, but you don’t want them to navigate to another page.
Modal/Dialog Box
Finally, a modal or dialog box is a message box that allows further interactivity of the page without navigating away from the current content in the browser. A modal box is not locked to the screen (i.e., the client can navigate away from it without a required interaction), though it is typically the user’s focus (based on your styling of the box). In most instances, if a user wants to dismiss the modal, they can simply close the box with a provided button, or click outside of the modal. An example of a modal is when a user needs to complete a form or provide specific information for a search query, but you don’t want them to navigate to another page.
`



window.onload = () => {
    //initial code:
    /*
    window.$0 = os.html({
        ext: document.body
    });
    */
      os.draw({
        $popup:{
            visible: false,
            classes: "popup",
            draw: os.templates.keypadFB(),
            msg: function(msg){
                this.fb.caller.text = msg;
                this.visible = false;              
            },
            fb: {                
                caller: {}
            }
        },
        $md:{
            source: "md/0.md",
            $svg: {
                $d22text: { 
                    text: "paok",
                    click: function(){
                        $popup.update = {
                            fb:{
                                caller: this //this $d22text
                            },
                            visible: "true"
                        }
                    }
                },
                $d35text: { 
                    text: "paok",
                    click: function(){
                        $popup.update = {
                            fb:{
                                caller: this //this $d35text
                            },
                            visible: "true"
                        }
                    }
                }
            },
            $1:{
                text: 666,
                input: {
                    placeholder: "τιμή",
                    clear: true,
                    action: function(value){
                        this.text = value;
                        $md.$svg.$d22text.text = value
                        $md.$2.text = value;
                        
                    }
                }
            },
            $2: {
                text: 777,
                click: function(){
                    this.text = + this.text + 1;
                }
            }
        },           
        $svg: {
            source: "svg/main.svg",
            visible: true,
            classes: "svg-wrapper",           
            //Τα παρακάτω είναι elements από το svg αρχείο.
            $d22status: {
                color: "green",
                click: function(){
                    this.color = "pink";
                    console.log(this);
                    //$pairs.visible = "toggle";
                      
                }
            },
            $d22text: {
                text: "122 bar",
                click: function(){
                    this.color = "blue";                   
                    $popup.msg = {
                        element: $svg.$d22text
                    };  
                },
                msg: function(msg){
                    this.text = msg;
                }
            }
        },
        $pairs: {
            classes: "pairs-wrapper",
            $1: os.templates.pairFB({
                description: "paokara1",
                keypad: true
            }),
            $2: {
                draw: os.templates.pairFB({
                    description: "par2"
                }),
                $value: {
                    input:{
                        action: function (value){
                            window.counter = value * 1;
                        },
                        placeholder: "paok",
                        clear: true
                    }
                }
            },
            $3: {
                draw: os.templates.pairFB({
                    description: "par3",
                    keypad: true
                })
            },        
            $4: {
                draw: os.templates.pairFB({
                    description: "par4",
                    buttons: ["start", "stop","reset", "ready", "reset timer"]
                })
            },
            $5: {
                draw: os.templates.pairFB({
                    description: "par5"
                })
            },
            $6: {
                draw: os.templates.pairFB({
                    description: "par6",
                    keypad: true
                })
            },
            $7: {
                draw: os.templates.pairFB({
                    description: "par7",
                    buttons: ["start", "stop","reset", "ready", "reset timer"]
                })
            },
            $8: {
                draw: os.templates.pairFB({
                    description: "par8"
                })
            },
            $9: {
                draw: os.templates.pairFB({
                    description: "par9",
                    keypad: true
                })
            },
            $10: {
                draw: os.templates.pairFB({
                    description: "par10",
                    keypad: true
                })
            },
            $11: {
                draw: os.templates.pairFB({
                    description: "par11",
                    keypad: true
                })
            },
            $12: {
                draw: os.templates.pairFB({
                    description: "par12",
                    keypad: true
                })
            },
            $13: {
                draw: os.templates.pairFB({
                    description: "par13",
                    keypad: true
                })
            },
            $14: {
                draw: os.templates.pairFB({
                    description: "par14",
                    keypad: true
                })
            },
            $15: {
                draw: os.templates.pairFB({
                    description: "par15",
                    keypad: true
                })
            },
            $16: {
                draw: os.templates.pairFB({
                    description: "par16",
                    keypad: true
                })
            },
            $17: {
                draw: os.templates.pairFB({
                    description: "par17",
                    keypad: true
                })
            },
            $18: {
                draw: os.templates.pairFB({
                    description: "par18",
                    keypad: true
                })
            },
            $19: {
                draw: os.templates.pairFB({
                    description: "par19",
                    keypad: true
                })
            },
            $20: {
                draw: os.templates.pairFB({
                    description: "par20",
                    keypad: true
                })
            }
        }              
    });

    if (supportsTouch){
       $pairs.$1.$value.text = "touch";
    } else {
       $pairs.$1.$value.text = "mouse";

    }
 
    
    /*
    window.mqtt = new os.Mqtt({address: "10.0.0.3:8000", topics: ["topic1"]});
    mqtt.onMsgFor["topic1"] = function (msg){
        $svg.$d22text.text = msg.d.real[0] + " bar";
        $svg.$d35text.text = msg.d.real[1] + " bar";
        //svg.d22text.click = function(){svg.d22status.stroke = "black";};
    
    };
    */
    //cycle code:
    window.counter = 0;
    setInterval(() => {
        $pairs.$2.$value.text = window.counter;
        window.counter = window.counter + 1;
    },0);
};
