export type MessageType =
  | 'awaiting_response'
  | 'compound_x-refs'
  | 'content_script_await_sidebar_readiness'
  | 'content_script_close_loading_icon'
  | 'content_script_close_sidebar'
  | 'content_script_get_page_contents'
  | 'content_script_highlight_entities'
  | 'content_script_is_page_compressed'
  | 'content_script_toggle_sidebar'
  | 'content_script_open_loading_icon'
  | 'content_script_open_modal'
  | 'content_script_open_sidebar'
  | 'content_script_remove_highlights'
  | 'content_script_scroll_to_highlight'
  | 'content_script_set_sidebar_ready'
  | 'csv_exporter_service_export_csv'
  | 'entity_messenger_service_highlight_clicked'
  | 'export_csv'
  | 'get_page_contents'
  | 'log'
  | 'markup_page'
  | 'min_entity_length_changed'
  | 'ner_current_page'
  | 'ner_lookup_performed'
  | 'ner_service_process_current_page'
  | 'open_modal'
  | 'popup_api_error'
  | 'popup_api_success'
  | 'settings-changed'
  | 'settings_clicked'
  | 'settings_service_get_settings'
  | 'settings_service_refresh_xref_sources'
  | 'settings_service_set_preferences'
  | 'settings_service_set_urls'
  | 'settings_service_set_xrefs'
  | 'sidebar_component_set_entities'
  | 'sidebar_data_total_count'
  | 'sidebar_data_update_cards'
  | 'sidebar_data_service_view_or_create_card'
  | 'sidebar_rendered'
  | 'x-ref_result'

// The receiver of the message must check the body to ensure it is the correct type based on the message type.
export interface Message {
  type: MessageType
  body?: any
}
