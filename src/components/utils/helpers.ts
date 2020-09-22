import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Coordinate } from 'ol/coordinate';
import LineString from 'ol/geom/LineString';
import { Circle, Stroke, Style, Fill, Icon, Text } from 'ol/style';
import Arrow from '../../img/arrow.png';
import Arrow1 from '../../img/arrow1.png';

interface SingleData {
  // coordinate: [number, number];
  latitude: number;
  longitude: number;
  [key: string]: any;
}

export const processDataES = (data: SingleData[]) => {
  data.reverse();
  const perDeviceRoute: { [key: string]: [number, number][] } = {};
  const perDeviceTime: { [key: string]: number[] } = {};
  const perDeviceUncertainty: { [key: string]: number[] } = {};
  const perDeviceFloor: { [key: string]: number[] } = {};
  data.map(datum => {
    (perDeviceRoute[datum.device_aid] = perDeviceRoute[datum.device_aid] || []).push([datum.longitude, datum.latitude]);
    (perDeviceTime[datum.device_aid] = perDeviceTime[datum.device_aid] || []).push(datum.timestamp);
    (perDeviceUncertainty[datum.device_aid] = perDeviceUncertainty[datum.device_aid] || []).push(datum.uncertainty);
    (perDeviceFloor[datum.device_aid] = perDeviceFloor[datum.device_aid] || []).push(datum.floor);
  });
  const perDeviceRoute_nonSinglePoint: { [key: string]: [number, number][] } = {};
  let singlePointCount = 0;
  Object.keys(perDeviceRoute).map(device_aid => {
    if (perDeviceRoute[device_aid].length > 1) {
      perDeviceRoute_nonSinglePoint[device_aid] = perDeviceRoute[device_aid];
    } else {
      singlePointCount++;
    }
  });
  return {
    perDeviceRoute: perDeviceRoute_nonSinglePoint,
    perDeviceTime,
    perDeviceUncertainty,
    singlePointCount,
    perDeviceFloor,
  };
};

export const createLine = (routeData: Coordinate[], iterRoute: number, floorData: number[]) => {
  let color = 'rgba(73,168,222)';
  let pic = Arrow;

  if (floorData[iterRoute] == -1) {
    color = 'rgba(255,176,0)';
  }

  if (floorData[iterRoute + 1] == -1) {
    pic = Arrow1;
  }

  const dx = routeData[iterRoute + 1][0] - routeData[iterRoute][0];
  const dy = routeData[iterRoute + 1][1] - routeData[iterRoute][1];
  const rotation = Math.atan2(dy, dx);
  const lineFeature = new Feature(new LineString([routeData[iterRoute], routeData[iterRoute + 1]]));
  // lineFeature.setProperties({ duration: `${timeData[iterRoute + 1] - timeData[iterRoute]}s` });
  lineFeature.setStyle([
    new Style({
      stroke: new Stroke({
        color: color,
        width: 2,
      }),
    }),
    new Style({
      geometry: new Point(routeData[iterRoute + 1]),
      image: new Icon({
        src: pic,
        anchor: [0.75, 0.5],
        rotateWithView: true,
        rotation: -rotation,
      }),
    }),
  ]);
  return lineFeature;
};

export const createLineWithLabel = (
  routeData: Coordinate[],
  timeData: number[],
  iterRoute: number,
  floorData: number[]
) => {
  let color = 'rgba(73,168,222)';
  let pic = Arrow;

  if (floorData[iterRoute] == -1) {
    color = 'rgba(255,176,0)';
  }

  if (floorData[iterRoute + 1] == -1) {
    pic = Arrow1;
  }

  const dx = routeData[iterRoute + 1][0] - routeData[iterRoute][0];
  const dy = routeData[iterRoute + 1][1] - routeData[iterRoute][1];
  const rotation = Math.atan2(dy, dx);
  const lineFeature = new Feature(new LineString([routeData[iterRoute], routeData[iterRoute + 1]]));
  // lineFeature.setProperties({ duration: `${timeData[iterRoute + 1] - timeData[iterRoute]}s` });
  lineFeature.setStyle([
    new Style({
      stroke: new Stroke({
        color: color,
        width: 2,
      }),
      text: new Text({
        stroke: new Stroke({
          color: '#fff',
          width: 2,
        }),
        font: '18px Calibri,sans-serif',
        text: `${timeData[iterRoute + 1] - timeData[iterRoute]}s`,
      }),
    }),
    new Style({
      geometry: new Point(routeData[iterRoute + 1]),
      image: new Icon({
        src: pic,
        anchor: [0.75, 0.5],
        rotateWithView: true,
        rotation: -rotation,
      }),
    }),
  ]);
  return lineFeature;
};

export const createPoint = (
  routeData: Coordinate[],
  routeRadiusData: number[],
  iterRoute: number,
  floorData: number[]
) => {
  let color = 'rgba(73,168,222,0.6)';

  if (floorData[iterRoute] == -1) {
    color = 'rgba(255,176,0,0.6)';
  }

  const pointFeature = new Feature(new Point(routeData[iterRoute]));
  pointFeature.setStyle(
    new Style({
      image: new Circle({
        radius: routeRadiusData[iterRoute] || 2,
        // radius: 5,
        fill: new Fill({ color: color }),
      }),
    })
  );
  return pointFeature;
};
