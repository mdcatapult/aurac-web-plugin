
export type MessageType = 
  'ner_current_page'
| 'get_page_contents'
| 'markup_page'
| 'compound_x-refs'
| 'x-ref_result'
| 'settings-changed'
| 'log'
| 'content_script_toggle_sidebar'
| 'content_script_open_sidebar'
| 'content_script_close_sidebar'
| 'sidebar_rendered'
| 'ner_lookup_performed'
| 'awaiting_response'
| 'remove_highlights'
| 'min-entity-length-changed'
| 'export_csv'
| 'open_modal'
| 'settings_clicked'
| 'sidebar_component_set_entities'
| 'content_script_set_sidebar_ready'
| 'content_script_await_sidebar_readiness'
| 'ner_service_process_current_page'
| 'content_script_get_page_contents'
| 'settings_service_get_settings'
| 'settings_service_set_settings'
| 'settings_service_refresh_xref_sources'
| 'content_script_open_loading_icon'
| 'content_script_close_loading_icon'
| 'content_script_highlight_entities'
| 'settings_service_get_current_recogniser'
| 'entity_messenger_service_highlight_clicked'
| 'sidebar_data_service_view_or_create_card'
| 'content_script_scroll_to_highlight'
| 'csv_exporter_service_export_csv';

// The receiver of the message must check the body to ensure it is the correct type based on the message type.
export interface Message {
  type: MessageType;
  body?: any;
}