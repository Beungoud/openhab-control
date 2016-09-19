module.exports = [
  {
    "type": "heading",
    "defaultValue": "OpenHab Quick commands"
  },
  {
    "type": "text",
    "defaultValue": "Configure your openHab server and desired items."
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Server Configuration"
      },
      {
        "type": "input",
        "messageKey": "ServerIP",
        "defaultValue": "http://192.168.1.30",
        "label": "OpenHab Server address"
      },
      {
        "type": "input",
        "messageKey": "ServerPort",
        "defaultValue": "8080",
        "label": "OpenHab Server port"
      }
    ]
  },
  {
    "type": "section",
    "id":"itemsSection",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Your items"
      },
      {
        "type": "button",
        "primary": true,
        "id":"addItemButton",
        "defaultValue": "+",
        "description":"Add new Item"
      },
      {
        "type": "section",
        "id":"itemsSubSection",
        "items": [
        ]
      }
    ]
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "UI Configuration"
      },
      {
        "type": "color",
        "messageKey": "BackgroundColor",
        "defaultValue": "0xFFFFFF",
        "label": "Background Color"
      },
      {
        "type": "color",
        "messageKey": "ForegroundColor",
        "defaultValue": "0x00AAFF",
        "label": "Foreground Color"
      }
    ]
  },
  {
    "type": "submit",
    "defaultValue": "Save Settings"
  }
];