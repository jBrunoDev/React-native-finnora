import React from 'react';
import {View, Text, TouchableOpacity} from "react-native";

const ListHeading = ({title}: ListHeadingProps) => {
    return(
        <View className = "list-head">
            <Text className= "list-title">{title}</Text>

            <TouchableOpacity className=" list-action">
                <Text className= "list-action-text">See all</Text>
            </TouchableOpacity>
        </View>
    )
}

export default ListHeading;