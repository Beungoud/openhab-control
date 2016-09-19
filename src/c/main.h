#include <pebble.h>

#define NUM_ITEM 3
#define CHECKBOX_WINDOW_CELL_HEIGHT 44
#define NB_MAX_ITEMS 20
#define MAX_LABEL_LEN 20

extern GColor backgroundColor;
extern GColor foregroundColor;
extern GColor textColor;
extern GColor selectedTextColor;
extern char  titles[NB_MAX_ITEMS][MAX_LABEL_LEN];
extern char  sub_titles[NB_MAX_ITEMS][MAX_LABEL_LEN];


static uint16_t get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *context);
static void window_unload(Window *window);
static void draw_row_callback(GContext *ctx, const Layer *cell_layer, MenuIndex *cell_index, void *context);
static void select_callback(struct MenuLayer *menu_layer, MenuIndex *cell_index, void *context);
static int16_t get_cell_height_callback(struct MenuLayer *menu_layer, MenuIndex *cell_index, void *context);
static void window_load(Window *window);
void init(void);
void deinit(void);
static void init_app_message();
static void inbox_received_handler(DictionaryIterator *iter, void *context);
static void resetColors();
