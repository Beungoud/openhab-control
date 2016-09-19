#pragma once

#include <pebble.h>

#define TEXT_ANIMATION_WINDOW_DURATION 40   // Duration of each half of the animation
#define TEXT_ANIMATION_WINDOW_DISTANCE 5    // Pixels the animating text move by
#define TEXT_ANIMATION_WINDOW_INTERVAL 1000 // Interval between timers

void send_command(int index, char* itemName, char* itemSubTitle);
void send_command_inbox_handler(DictionaryIterator *iter, void *context);

