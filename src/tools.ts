import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TellaClient } from "./tellaClient.js";

// ── Tool definitions ─────────────────────────────────────────────────────────

export const tools: Tool[] = [
  // ── Videos ──────────────────────────────────────────────────────────────
  {
    name: "tella_list_videos",
    description: "List all videos in your Tella workspace. Supports pagination and optional filtering by playlist.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max videos to return (default 20, max 100)." },
        cursor: { type: "string", description: "Pagination cursor from a previous response." },
        playlist_id: { type: "string", description: "Filter by playlist ID." },
      },
    },
  },
  {
    name: "tella_get_video",
    description: "Get full details for a single Tella video by its ID, including transcript, chapters, and embed links.",
    inputSchema: {
      type: "object",
      required: ["video_id"],
      properties: {
        video_id: { type: "string", description: "The Tella video ID." },
      },
    },
  },
  // ── Playlists ────────────────────────────────────────────────────────────
  {
    name: "tella_list_playlists",
    description: "List all playlists in your Tella workspace.",
    inputSchema: { type: "object", properties: {} },
  },
  // ── Webhooks ─────────────────────────────────────────────────────────────
  {
    name: "tella_list_webhooks",
    description: "List all webhook endpoints configured in your Tella workspace.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "tella_create_webhook",
    description: "Create a new webhook endpoint to receive Tella events (e.g. video.created, export.ready).",
    inputSchema: {
      type: "object",
      required: ["url", "events"],
      properties: {
        url: { type: "string", description: "HTTPS URL to receive webhook payloads." },
        events: {
          type: "array",
          items: { type: "string" },
          description: "Event types to subscribe to. Supported: video.created, export.ready, video.deleted.",
        },
      },
    },
  },
  {
    name: "tella_delete_webhook",
    description: "Delete a webhook endpoint by its ID.",
    inputSchema: {
      type: "object",
      required: ["webhook_id"],
      properties: {
        webhook_id: { type: "string", description: "The webhook endpoint ID to delete." },
      },
    },
  },
  // ── Zoom Annotations ─────────────────────────────────────────────────────
  {
    name: "tella_add_zoom_annotation",
    description: [
      "Add a cinematic zoom / focus annotation to a Tella video recording plan.",
      "Specify the timestamp, the screen region (x%, y% from top-left), zoom level, and an optional label.",
      "Use this to pre-plan which parts of the screen should be zoomed in on during a product demo.",
    ].join(" "),
    inputSchema: {
      type: "object",
      required: ["video_id", "timestamp_seconds", "x", "y", "zoom_level"],
      properties: {
        video_id: { type: "string", description: "Tella video ID (or a planned recording ID)." },
        timestamp_seconds: { type: "number", description: "Timestamp in seconds where the zoom occurs." },
        x: { type: "number", description: "Horizontal focus point as percentage of screen width (0–100)." },
        y: { type: "number", description: "Vertical focus point as percentage of screen height (0–100)." },
        zoom_level: { type: "number", description: "Zoom multiplier (e.g. 1.5, 2.0, 2.5, 3.0)." },
        label: { type: "string", description: "Optional label describing what is being highlighted (e.g. 'Click Add Budget')." },
      },
    },
  },
  {
    name: "tella_get_zoom_annotations",
    description: "Retrieve all planned zoom annotations for a video.",
    inputSchema: {
      type: "object",
      required: ["video_id"],
      properties: {
        video_id: { type: "string", description: "The Tella video ID." },
      },
    },
  },
  {
    name: "tella_clear_zoom_annotations",
    description: "Clear all zoom annotations for a video (reset the plan).",
    inputSchema: {
      type: "object",
      required: ["video_id"],
      properties: {
        video_id: { type: "string", description: "The Tella video ID." },
      },
    },
  },
  {
    name: "tella_export_zoom_script",
    description: "Export the zoom annotation plan as a human-readable script (useful for guiding a Tella recording session).",
    inputSchema: {
      type: "object",
      required: ["video_id"],
      properties: {
        video_id: { type: "string", description: "The Tella video ID." },
      },
    },
  },
];

// ── Tool dispatcher ───────────────────────────────────────────────────────────

export async function handleTool(
  name: string,
  args: Record<string, any>,
  client: TellaClient
): Promise<any> {
  switch (name) {
    // Videos
    case "tella_list_videos":
      return client.listVideos({
        limit: args.limit ?? 20,
        cursor: args.cursor,
        playlist_id: args.playlist_id,
      });

    case "tella_get_video":
      return client.getVideo(args.video_id);

    // Playlists
    case "tella_list_playlists":
      return client.listPlaylists();

    // Webhooks
    case "tella_list_webhooks":
      return client.listWebhooks();

    case "tella_create_webhook":
      return client.createWebhook(args.url, args.events);

    case "tella_delete_webhook":
      return client.deleteWebhook(args.webhook_id);

    // Zoom annotations
    case "tella_add_zoom_annotation":
      return client.addZoomAnnotation({
        video_id: args.video_id,
        timestamp_seconds: args.timestamp_seconds,
        x: args.x,
        y: args.y,
        zoom_level: args.zoom_level,
        label: args.label,
      });

    case "tella_get_zoom_annotations":
      return client.getZoomAnnotations(args.video_id);

    case "tella_clear_zoom_annotations":
      return client.clearZoomAnnotations(args.video_id);

    case "tella_export_zoom_script":
      return { script: client.exportZoomScript(args.video_id) };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
