import React from 'react';
import './App.css';
import TDViewer from './TDViewer/TDViewer'
import WoTLibrary from "./WoTLibrary";

class App extends React.Component {
    WOT = new WoTLibrary();

    constructor(props) {
        super(props)
        this.state = {td: ''}
    }


    render() {
        return (
            <div>
                <header>
                    <h1>EdiTDor - The best tool for viewing WoT-TDs</h1>
                </header>
                <main>
                    <div className="tdURL">
                        <input type="url" name="url" id="url"
                               placeholder="https://example.com"
                               pattern="https://.*" size="50"
                               onKeyPress={(event) => this.runScript(event)}
                               required/>
                    </div>
                    {this.state.td && <TDViewer td={this.state.td} wot={this.WOT} /> }
                </main>
                <footer>
                    <p>A tool for viewing and editing your great ThingDescription</p>
                </footer>
            </div>
        );
    }

    runScript(e) {
        //Pressing "Enter" Key will start this function
        if (e.keyCode === 13 || e.which === 13) {
            let url = e.target.value;
            if (this.validateURL(url)) {
                this.loadTDFromURL(url)
            }
        }
    }

    validateURL(url) {
        const regex = "((([A-Za-z]{3,9}:(?:\\/\\/)?)(?:[-;:&=\\+\\$,\\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\\+\\$,\\w]+@)[A-Za-z0-9.-]+)((?:\\/[\\+~%\\/.\\w-_]*)?\\??(?:[-\\+=&;%@.\\w_]*)#?(?:[\\w]*))?)";
        const resultArray = url.match(regex);
        if (!resultArray) {
            alert('Please enter a valid URL.');
            return false
        }
        if (resultArray.join(',') === '') {
            alert('Please enter a valid URL.');
            //TODO: Show Usererror --> Entered URL not valid.
            return false;
        }
        return true;
    }

    async loadTDFromURL(url) {
        try {
            let res = await fetch(url);
            let td = await res.json()
            if(this.validateTD(td)) {
            this.setState({td})
            this.WOT.consumeTD(td);
            }else {
                //TODO: check if it is a list
                //Else: Show error.
            }
        } catch (e) {
            alert('Sorry we were not able to load the TD. Please check the URL.')
            console.log(e);
            //TODO: Show Usererror --> unable to load TD
        }

    }


    validateTD(td) {
        //https://www.w3.org/TR/wot-scripting-api/#validating-a-thing-description
        return true;
    }
}

export default App;
