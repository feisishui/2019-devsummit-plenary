import MapView = require("esri/views/MapView");
import SceneView = require("esri/views/SceneView");
import WebMap = require("esri/WebMap");
import TileLayer = require("esri/layers/TileLayer");
import WebScene = require("esri/WebScene");
import { ClassBreaksRenderer } from "esri/renderers";
import { PictureMarkerSymbol } from "esri/symbols";
import Header from "../widgets/Header";
import Slider from "../widgets/Slider";
import ToggleIconButton from "../widgets/ToggleIconButton";
import ActionButton = require("esri/support/actions/ActionButton");
import GeoJSONLayer = require("esri/layers/GeoJSONLayer");
import SizeVariable = require("esri/renderers/visualVariables/SizeVariable");
import Expand = require("esri/widgets/Expand");
import histogram = require("esri/renderers/smartMapping/statistics/histogram");
import FeatureFilter = require("esri/views/layers/support/FeatureFilter");
import FeatureLayerView = require("esri/views/layers/FeatureLayerView");

let scene: WebScene;
let sceneView: SceneView;

function createLayer() {
  return new GeoJSONLayer({
    url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson",
    title: "USGS Earthquakes",
    copyright: "USGS",
    // timeInfo: {
    //   endTimeFie
    // },
    fields: [
      {
        "name": "mag",
        "type": "double"
      },
      {
        "name": "place",
        "type": "string"
      },
      {
        "name": "time",
        "type": "date"
      },
      {
        "name": "url",
        "type": "string"
      },
      {
        "name": "title",
        "type": "string"
      }
    ],
    elevationInfo: {
      mode: "absolute-height",
      unit: "kilometers",
      featureExpressionInfo: {
        expression: "Geometry($feature).z * -1"
      }
    },
    // elevationInfo: {
    //   mode: "absolute-height",
    //   unit: "kilometers",
    //   featureExpressionInfo: {
    //     expression: "Geometry($feature).z * -1"
    //   }
    // },
    popupTemplate: {
      title: `{title}`,
      content: `
        Earthquake of magnitude {mag} on {time}.<br />
      `,
      outFields: ["url"],
      actions: [
        new ActionButton({
          id: "more-details",
          title: "More details"
        })
      ]
    },
    renderer: new ClassBreaksRenderer({
      field: "mag",
      classBreakInfos: [
        {
          minValue: -10,
          maxValue: 1,
          symbol: new PictureMarkerSymbol({
            url: "src/2_geojson/Mag2.png"
          })
        },
        {
          minValue: 1,
          maxValue: 4,
          symbol: new PictureMarkerSymbol({
            url: "src/2_geojson/Mag3.png"
          })
        },
        {
          minValue: 4,
          maxValue: 5,
          symbol: new PictureMarkerSymbol({
            url: "src/2_geojson/Mag4.png"
          })
        },
        {
          minValue: 5,
          maxValue: 6,
          symbol: new PictureMarkerSymbol({
            url: "src/2_geojson/Mag5.png"
          })
        },
        {
          minValue: 6,
          maxValue: 7,
          symbol: new PictureMarkerSymbol({
            url: "src/2_geojson/Mag6.png"
          })
        },
        {
          minValue: 7,
          maxValue: 10,
          symbol: new PictureMarkerSymbol({
            url: "src/2_geojson/Mag7.png"
          })
        }
      ],
      visualVariables: [
        new SizeVariable({
          field: "mag",
          legendOptions: {
            title: "Magnitude",
            showLegend: false
          },
          stops: [{
            value: 2.5,
            size: 12,
            label: "> 2.5"
          },
          {
            value: 7,
            size: 40
          },
          {
            value: 8,
            size: 80,
            label: "> 8"
          }]
        })
      ]
    })
  });
}

(async () => {
  scene = new WebScene({
    basemap: { portalItem: { id: "39858979a6ba4cfd96005bbe9bd4cf82" } },
    ground: "world-elevation",
    layers: [createLayer()]
  });

  sceneView = new SceneView({
    container: "viewDiv",
    map: scene,
    qualityProfile: "high",
    // viewingMode: "local",
    ui: {
      padding: {
        top: 80
      },
      components: ["attribution"]
    },
    environment: {
      background: {
        type: "color",
        color: "black"
      }
      // starsEnabled: false,
      // atmosphereEnabled: false
    }
  });
  scene.ground.navigationConstraint = {
    type: "none"
  };

  setupUI(sceneView);

  sceneView.ui.add(
    new Expand({
      content: new Slider({
        min: 0,
        max: 1,
        step: 0.1,
        value: 1,
        title: "Ground opacity",
        action: (value) => {
          scene.ground.opacity = value;
        }
      })
    }),
    "top-left"
  )
})();

async function setupUI(view: MapView | SceneView) {
  const [Legend, Zoom, Home, { default: Indicator }] = await Promise.all([
    import("esri/widgets/Legend"),
    import("esri/widgets/Zoom"),
    import("esri/widgets/Home"),
    import("../widgets/Indicator")
  ]);

  const zoom = new Zoom({
    view,
    layout: "horizontal"
  });

  const home = new Home({
    view
  });

  view.ui.add(zoom, "bottom-left");
  view.ui.add(home, "bottom-left");

  view.ui.add(new Header({
    title: "GeoJSON"
  }));

  view.popup.viewModel.on("trigger-action", (event) => {
    if (event.action.id === "more-details") {
      window.open(view.popup.viewModel.selectedFeature.attributes.url, "_blank");
    }
  });
}
