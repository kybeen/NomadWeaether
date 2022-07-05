import * as Location from 'expo-location';
import { StatusBar } from "expo-status-bar";
import { Fontisto } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from "react-native";

const { width:SCREEN_WIDTH } = Dimensions.get('window');  // 어떤 핸드폰을 써도 똑같은 크기로 나오도록 하기 위해 핸드폰의 사이즈를 받아온다.
//console.log(SCREEN_WIDTH);
const API_KEY = "발급받은 API 키";
// OpenWeatherMap 사이트 회원가입 후 받은 API key임 이론적으로는 API key를 서버에 두고, 서버로 요청하는게 맞지만 이건 공부용이니 걍 이렇게 함. 실제로는 보안상 위험하니 절대 X

const icons = {
  "Clouds": "cloudy",
  "Clear": "day-sunny",
  "Rain": "rain",
  "Atmosphere": "cloudy-gusts",
  "Snow": "snow",
  "Drizzle": "day-rain",
  "Thunderstorm": "lightning",
};

export default function App() {
  const [city, setCity] = useState("Loading....");
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);

  const getWeather = async() => {
    const {granted} = await Location.requestForegroundPermissionsAsync(); // 유저에게 위치를 받을 수 있게 허락해 달라고 요청
    if(!granted){ // 허락 X면
      setOk(false);
    }

    const {coords:{latitude, longitude}} = await Location.getCurrentPositionAsync({accuracy:5});  // 유저의 위도, 경도 받아옴
    const location = await Location.reverseGeocodeAsync(  // reverseGeocode : 위도, 경도를 받아서 주소를 반환해줌
      {latitude, longitude},
      {useGoogleMaps:false}
    );
    setCity(location[0].city); // 받은 도시로 setCity 해준다.
    // 받은 도시로 API 호출 -> 많은 정보가 담겨 있는 응답을 받을 것임
    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`)
    const json = await response.json();
    setDays(json.daily);  // 응답을 받고 필요한 내용만 추려서 state인 days로 넣어준다.(많은 반환 값들 중 "daily"의 내용만 갖고오면 됨 -> 7일간의 기상정보 array)
  };

  useEffect(() => {
    getWeather(); //  어플 시작할 때 딱 한번만 날씨를 불러온다.
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar style="black"/>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView 
        showsHorizontalScrollIndicator={false} 
        pagingEnabled 
        horizontal 
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ? (  // 기상정보를 받아오지 못해서 days가 비어 있는 array일 경우 ActivityIndicator의 내용 출력(로딩화면)
          <View style={{ ...styles.day, alignItems: "center" }}>
            <ActivityIndicator 
            style={{ marginTop:10 }}
            size="large" 
            color="black" />
          </View>
        ) : ( // 기상정보를 받아와서 days의 내용이 있을 경우 각 days를 컴포넌트로 바꾼 뒤 리턴
          days.map((day, index) => 
          <View key={index} style={styles.day}>
            <View style={{ 
              flexDirection: "row",
              alignItems: "center",
              alignItems: "flex-end",
              width: "95%",
              justifyContent: "space-between",
               }}>
              <Text style={styles.temperature}>{parseFloat(day.temp.day).toFixed(1)}</Text>
              <Fontisto name={icons[day.weather[0].main]} size={70} color="black" />
            </View>
            <Text style={styles.description}>{day.weather[0].main}</Text>
            <Text style={styles.tinyText}>{day.weather[0].description}</Text>
          </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFEF07"
  },
  city: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    marginTop: 20,
    fontSize: 60,
    fontWeight: "500",
  },
  weather: {
  },
  day: {
    width: SCREEN_WIDTH,
  },
  temperature: {
    marginTop: 60,
    marginLeft: 15,
    fontSize: 110,
  },
  description: {
    marginTop: -10,
    marginLeft: 15,
    fontSize: 30,
  },
  tinyText: {
    fontSize: 20,
    marginLeft: 15,
  }
})