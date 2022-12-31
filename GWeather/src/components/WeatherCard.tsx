import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle} from '@ionic/react';
import { useEffect, useState } from 'react';
import './WeatherCard.css';

import weatherCode from '../data/weatherCode.json';

import { TextToSpeech } from '@capacitor-community/text-to-speech';




interface ContainerProps { givenDate: string, wcode: string }

const WeatherCard: React.FC<ContainerProps> = ({givenDate, wcode}) => {

    const [iconType, setIconType] = useState("help-circle");
    const [weather, setWeather] = useState<any>("Unknown");

    useEffect(() => {

        //get the relevant wcode data
        const wdata = weatherCode.find( entry => entry.wcode === wcode);
        setWeather(wdata?.description);

        //change the iconType depending on weather code category
        if(wdata?.category === "Clear"){ setIconType("sunny-outline"); }
        else if (wdata?.category === "Cloudy"){setIconType("cloudy-outline");}
        else if (wdata?.category === "Fog"){setIconType("cloud-circle-outline");}
        else if (wdata?.category === "Rain"){setIconType("rainy-outline");}
        else if (wdata?.category === "Snow"){setIconType("snow-outline");}
        else if (wdata?.category === "Thunderstorm"){setIconType("thunderstorm-outline");}
        else {setIconType("help-outline");}


    }, [wcode]);


    function onCardClick(text:string){
      console.log("Text-to-Speach Activated!");
      TextToSpeech.speak({
        text: text,
        lang: 'en-US',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
      });
    
    }
    


  return (

    <IonCard onClick={() => onCardClick(weather)}>
        <IonCardHeader >
            <img alt="Picture should be here" src={"assets/img/" + iconType + ".svg"}></img>
            <IonCardTitle>{weather}</IonCardTitle>
            <IonCardSubtitle>{givenDate}</IonCardSubtitle>
        </IonCardHeader>
    </IonCard>

  );
};

export default WeatherCard;
