module.exports = function(minified) {
  var clayConf = this;
  var _ = minified._;
  var $ = minified.$;
  var HTML = minified.HTML;

  function addNewItem() {
    console.log("Clicked");
    console.log("2");
    console.log(clayConf);
    var subSection = findItemsSubSection();
    addNewItemBellow(subSection);
    clayConf.build();
  }

  /**
   * Find the subsection where to add/remove items
   */
  function findItemsSubSection()
  {
    for (var i = 0; i < clayConf.config.length; i++) {
      if (clayConf.config[i].id === "itemsSection")
      {
        for (var j = 0; j < clayConf.config[i].items.length; j++ )          
        {
          if (clayConf.config[i].items[j].id === "itemsSubSection")
          {
            return clayConf.config[i].items[j];
          }
        }
      }
    }
  }

  /**
   * Remove an item in the itemsSection
   */
  function removeItemBellow(parentItem, itemIndex)
  {
    console.log("Removing : " + itemIndex);

    for(var itemId = itemIndex; itemId <  parentItem.items.length -1 ; itemId++)
    {
      var nextItemId = itemId + 1;
      console.log("moving values from " + nextItemId + " to " + itemId);
      clayConf.getItemByMessageKey("ItemName[" + itemId + "]").set(clayConf.getItemByMessageKey("ItemName[" + nextItemId + "]").get());
      clayConf.getItemByMessageKey("ItemLabel[" + itemId + "]").set(clayConf.getItemByMessageKey("ItemLabel[" + nextItemId + "]").get());
    }
    var itemCount =  parentItem.items.length - 1;
    parentItem.items = [];
    for (var i = 0; i < itemCount; i++)
    {
      addNewItemBellow(parentItem);
    }
  }

  /**
     * Add a new item in the section passed as parameter.
     */
  function addNewItemBellow(parentItem)
  {
    var itemId =  parentItem.items.length ;
    var item = {
      "type" : "section",
      "id" : "SubSection" + itemId,
      "items" : [
        {
          "type": "input",
          "messageKey": "ItemName[" + itemId + "]",
          "defaultValue": "PetiteTelec" +  itemId,
          "label": "Id of the Item Nb " +  itemId
        },
        {
          "type": "input",
          "messageKey": "ItemLabel[" + itemId + "]",
          "defaultValue": "Tetris",
          "label": "The label to show for item " +  itemId
        },
        {
          "type": "button",
          "id":"removeItem" + itemId,
          "defaultValue": " - (" + itemId + ")"
          //            "description":"Add new Item"
        }
      ]
    };
    parentItem.items.push(item);
    return item;
  }

  /**
   * Custom serialization function
   */
  function mySerialize()
  {
    var items = clayConf.getAllItems();
    var result=[];
    for(var i = 0; i < items.length; i++)
    {
     var key = items[i].messageKey;
      console.log("KEY:" + key);
      if (key)
        {
          result[key] = items[i].get();
        }
    }
    return result;
  }
  
  /**
   * Restore the previous values
   */
  function myRestore(previousValues)
  {
    for (var key in previousValues)
      {
        var item = clayConf.getItemByMessageKey(key);
        if (item)
        {
          if (item.config.type == "color")
          {
            item.set(Number(previousValues[key])); 
          } else {
            item.set(previousValues[key]);
          }
        }
      }
  }

  console.log("Starting configuration");
  console.log(clayConf);

  var previousValues;

  clayConf.on(clayConf.EVENTS.BEFORE_DESTROY, function() {
    console.log("BeforeDestroy");
    previousValues = mySerialize();
  });

  clayConf.on(clayConf.EVENTS.BEFORE_BUILD, function() {
    console.log("BEFOREBUILD");
    // On first build (when launching webview)
    if (!previousValues)
    {
      console.log("BEFOREBUILD - Restoring values");
      previousValues = clayConf.meta.userData;
      // Now that we have the correct configuration, 
      // restore the number of items.
      var parentItem = findItemsSubSection();
      parentItem.items = [];
      for (var i =0; i < 40; i++)
      {
        if (previousValues["ItemName[" + i + "]"] !== undefined)
        {
          console.log("Adding entry for i= " + i);
          addNewItemBellow(parentItem);
        }
      }
    }
  });

  clayConf.on(clayConf.EVENTS.AFTER_BUILD, function() {
    if (previousValues !== undefined)
    {
      myRestore(previousValues);
    }
    var addItemButton = clayConf.getItemById('addItemButton');
    addItemButton.on('click', addNewItem);

    var subSect = findItemsSubSection();
    for(var i = 0; i <  subSect.items.length ; i++)
    {
      (function() {var j = i;
      var removeItemButton = clayConf.getItemById('removeItem' + i);
      removeItemButton.on('click', function()
                          {
                            removeItemBellow(subSect, j);
                            clayConf.build();
                          });
                 })();
    }

  });
};
