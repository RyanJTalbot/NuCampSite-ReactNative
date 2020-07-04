import React, { Component } from "react";
import {Text, View, ShadowPropTypesIOS} from "react-native";
import { Card } from "react-native-elements";
import { CAMPSITES } from "../shared/campsites";



function RenderCampsite({campsite}){
    if(campsite){
        return (
            <Card 
                featuredTitle={campsite.name}
                image={require("./images/react-lake.jpg")}
            >
                <Text style={{margin:10}}> {campsite.description} </Text> 
            </Card>

        )
    } else {
        return <View/>
    }
}


export default class campsiteInfo extends Component {

    constructor(props){
        super(props);
        this.state = {
            campsites: CAMPSITES
        }
    }

    static navigationOptions = {
        tilte:"Campsite Information"
    }

    render() {
        const campsiteId = this.props.navigation.getParam("campsiteId");
        const campsite = this.state.campsites.filter( camp => camp.id == campsiteId)[0];

        return <RenderCampsite campsite={campsite} />
    }
}
