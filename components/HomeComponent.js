import React, { Component } from "react";
import { View, Text, ScrollView } from "react-native";
import { Card } from "react-native-elements";
import { CAMPSITES } from "../shared/campsites";
import { PROMOTIONS } from "../shared/promotions";
import { PARTNERS } from "../shared/partners";


function RenderItem({item}){
    if(item){
        return(
            <Card
                featuredTitle={item.name}
                image={require("./images/react-lake.jpg")}>
                
                <Text style={{margin: 10}} >
                    {item.description}
                </Text>
            </Card>
        );
    }

    return <View/>
}

export default class Home extends Component {
    constructor(props){
        super(props);
        this.state = {
            campsites: CAMPSITES,
            promotinos: PROMOTIONS,
            partners: PARTNERS 
        }
    }

    static navigationOptions = {
        title: "Home"
    }

    render(){
        const { campsites, promotinos, partners } = this.state;
        return (
            <ScrollView>
                <RenderItem item={campsites.filter(camp => camp.featured)[0]} />
                <RenderItem item={promotinos.filter(promotion => promotion.featured)[0]} />
                <RenderItem item={partners.filter(partner => partner.featured)[0]} />
            </ScrollView>
        )
    }


}