#include <pebble.h>
#include "main.h"
#include "sendcommand.h"
#include "configrequired.h"

Window *my_window;
TextLayer *text_layer;
static MenuLayer *s_menu_layer;

#define PERSIST_BACKGROUND 1
#define PERSIST_FOREGROUND 2
#define PERSIST_NB_ITEMS 3
#define PERSIST_LABELS 10

GColor backgroundColor;
GColor foregroundColor;
GColor textColor;
GColor selectedTextColor;

char  titles[MAX_LABEL_LEN][NB_MAX_ITEMS];
char  sub_titles[MAX_LABEL_LEN][NB_MAX_ITEMS];
int nbItems = 0;

int main(void) {
  init();
  app_event_loop();
  deinit();
}

static void init_app_message() {
  // Initialize AppMessage
  app_message_register_inbox_received(inbox_received_handler);
  app_message_open(256, 256);
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Waiting for notification");
}

static uint16_t get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *context) {
//   return sizeof(titles) / sizeof(int*);
  return nbItems;
}

static void window_unload(Window *window) {
  menu_layer_destroy(s_menu_layer);
}

static void draw_row_callback(GContext *ctx, const Layer *cell_layer, MenuIndex *cell_index, void *context) {
//  char subtitle[20];
//  snprintf(subtitle, sizeof(subtitle), "Item %i", cell_index->row);
  menu_cell_basic_draw(ctx, cell_layer, titles[cell_index->row], sub_titles[cell_index->row], NULL);
}

static void select_callback(struct MenuLayer *menu_layer, MenuIndex *cell_index, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Menu pressed : %i", cell_index->row );
  send_command(cell_index->row ,titles[cell_index->row],sub_titles[cell_index->row]);
}

static int16_t get_cell_height_callback(struct MenuLayer *menu_layer, MenuIndex *cell_index, void *context) {
  return PBL_IF_ROUND_ELSE(
    menu_layer_is_index_selected(menu_layer, cell_index) ?
      MENU_CELL_ROUND_FOCUSED_SHORT_CELL_HEIGHT : MENU_CELL_ROUND_UNFOCUSED_TALL_CELL_HEIGHT,
    CHECKBOX_WINDOW_CELL_HEIGHT);
}

static void inbox_received_handler(DictionaryIterator *iter, void *context) {
  Tuple *ready_tuple = dict_find(iter, MESSAGE_KEY_APP_READY);
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Message received");
  if (ready_tuple) {
    APP_LOG(APP_LOG_LEVEL_DEBUG, "ready_tuple");
  }
  Tuple *backgroundColor_tuple = dict_find(iter, MESSAGE_KEY_BackgroundColor);
  if (backgroundColor_tuple)
    {
    APP_LOG(APP_LOG_LEVEL_DEBUG, "Background color updated");
    backgroundColor = GColorFromHEX(backgroundColor_tuple->value->int32);
    persist_write_int(PERSIST_BACKGROUND, backgroundColor_tuple->value->int32);
  }
  Tuple *foregroundColor_tuple = dict_find(iter, MESSAGE_KEY_ForegroundColor);
  if (foregroundColor_tuple)
    {
    APP_LOG(APP_LOG_LEVEL_DEBUG, "Foreground color updated");
    foregroundColor = GColorFromHEX(foregroundColor_tuple->value->int32);
    persist_write_int(PERSIST_FOREGROUND, foregroundColor_tuple->value->int32);
  }
  int i;
  for (i = 0; i < NB_MAX_ITEMS; i++)
  {
    Tuple *label_tuple = dict_find(iter, MESSAGE_KEY_ItemLabel + i);
    if (label_tuple)
    {
      APP_LOG(APP_LOG_LEVEL_DEBUG, "New label for %i : %s",  i,label_tuple->value->cstring );
      strncpy(titles[i], label_tuple->value->cstring, MAX_LABEL_LEN);
      strncpy(sub_titles[i], "ready", MAX_LABEL_LEN);
      nbItems = i + 1;
      persist_write_string(PERSIST_LABELS + i, titles[i]);
      APP_LOG(APP_LOG_LEVEL_DEBUG, "Writing nbItems : %d",  nbItems );
      persist_write_int(PERSIST_NB_ITEMS, nbItems);
    }
  }
  resetColors();

  if (nbItems > 0)
  {
    dialog_config_window_pop();
  }
  else {
    dialog_config_window_push();
  }

  send_command_inbox_handler(iter, context);
}

static void resetColors() {
  menu_layer_set_normal_colors(s_menu_layer, backgroundColor, textColor);
  menu_layer_set_highlight_colors(s_menu_layer, foregroundColor, selectedTextColor);
  layer_mark_dirty((Layer*)s_menu_layer);
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  s_menu_layer = menu_layer_create(bounds);
  resetColors();
  menu_layer_set_click_config_onto_window(s_menu_layer, window);
  menu_layer_set_callbacks(s_menu_layer, NULL, (MenuLayerCallbacks) {
      .get_num_rows = get_num_rows_callback,
      .draw_row = draw_row_callback,
      .get_cell_height = get_cell_height_callback,
      .select_click = select_callback,
  });
  layer_add_child(window_layer, menu_layer_get_layer(s_menu_layer));
}

void init(void) {
  // Restore persisted statuses  
  if (persist_exists(PERSIST_NB_ITEMS))
  {
    nbItems = persist_read_int(PERSIST_NB_ITEMS);
    APP_LOG(APP_LOG_LEVEL_DEBUG, "NB Items : %i", nbItems);
    int i;
    for (i = 0; i < nbItems; i++)
    {
      persist_read_string(PERSIST_LABELS + i,titles[i], MAX_LABEL_LEN );
      strncpy(sub_titles[i], "...", MAX_LABEL_LEN);
    }
  }
  if (persist_exists(PERSIST_BACKGROUND)) {
    backgroundColor =GColorFromHEX( persist_read_int(PERSIST_BACKGROUND));
  } else {
    backgroundColor = GColorWhite;
  }
  if (persist_exists(PERSIST_FOREGROUND)) {
    foregroundColor =GColorFromHEX(persist_read_int(PERSIST_FOREGROUND));
  } else {
    foregroundColor = GColorVividCerulean;
  }
  textColor = GColorBlack;
  selectedTextColor = GColorBlack;
#ifndef PBL_COLOR
  foregroundColor = GColorBlack;
  backgroundColor = GColorWhite;
  selectedTextColor = GColorWhite;
#endif

  init_app_message();
  my_window = window_create();
  window_set_window_handlers(my_window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  window_stack_push(my_window, true);
  
  // If the app is not configured, show message.
  if (nbItems == 0)
  {
    dialog_config_window_push();
  }
}

void deinit(void) {
  text_layer_destroy(text_layer);
  window_destroy(my_window);
}
