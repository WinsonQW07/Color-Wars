const template = document.createElement("template");
template.innerHTML = `
<style>
div{
    font-family: 'butler_stencilbold';
    height: 570px;
    width: 280px;
    border: 5px solid black;
    border-radius: 20px;
    padding: .5rem;
    background: linear-gradient(#000, #9f00fd, #000);
    font-size: .7rem;
    position: relative;
    margin: 2rem;
    margin-top: 2rem;
    margin-left: 5rem;
}
  
h2{
    font-size: 1.8rem;
    line-height: 1.2;
    margin-top: 0;
    color: white;
    text-align: center;
    background: linear-gradient(to right, #4D4D4D, #000000, #4D4D4D);
    padding: 4px;
}
  
p, section{
    font-size: .9rem;
    color: white;
    text-align: left;
    background: linear-gradient(to right, #4D4D4D, #000000, #4D4D4D);
    padding: 2px;
    padding-left: .5rem;
}

#largeText{
    font-size: 1.1rem;
    margin-bottom: 0;
    margin-top: 1.2rem;
}
</style>

<div>
    <h2>Tips</h2>

    <section>
    <p id = "largeText">
    Press the left mouse button to fire a shot.
    </p>

    <p id>
    - The speed and direction of the shot is based on the position of the mouse when fired.
     Another shot can't be fired until all of your active bullets have disappeared.
    </p>

    <p id = "largeText">
    Press E to toggle between a piercing shot and a standard shot. 
    </p>

    <p>
    - A piercing shot has extra piercing power so it can destroy more blocks before it disappears.
    
    </p>

    <p id = "largeText">
    Press Q to change the color of multiple blocks in the level into your color.
    </p>
    </section>

</div>
`;

class CWTips extends HTMLElement{
    constructor(){
        super();

    //1 - attach a shadow DOM tree to this instance - this creates .shadowRoot for us
    this.attachShadow({mode: "open"});

    //2 - clone "template" and append it
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.h2 = this.shadowRoot.querySelector("h2");
    this.p1 = this.shadowRoot.querySelector("#skillTips");
    }
} //class

customElements.define('my-tips', CWTips);