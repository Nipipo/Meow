using MelonLoader;
using System.Net.Http;
using System.Text.Json;
using UnityEngine;

public class GameAnalyticsMod : MelonMod
{
    private static readonly HttpClient httpClient = new HttpClient();

    public override void OnApplicationStart()
    {
        // Log that the mod has started
        MelonLogger.Msg("GameAnalyticsMod Initialized");
    }

    public override void OnUpdate()
    {
        // Example: Log an event every update cycle for debugging
        SendFakeEvent();
    }

    private async void SendFakeEvent()
    {
        string url = "http://localhost:3000/v2/16bd90bfd7369b12f908dc62b1ee1bfc/events";
        var eventData = new
        {
            v = 2,
            user_id = "fake_user_id",
            client_ts = 1727191053,
            sdk_version = "unity 6.5.2",
            os_version = "windows 10.0.22631",
            manufacturer = "unknown",
            device = "desktop",
            platform = "windows",
            session_id = "fake_session_id",
            session_num = 99,
            connection_type = "lan",
            build = "1.0.0"
        };

        var jsonContent = new StringContent(JsonSerializer.Serialize(eventData));
        jsonContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");

        try
        {
            var response = await httpClient.PostAsync(url, jsonContent);
            string responseString = await response.Content.ReadAsStringAsync();
            MelonLogger.Msg($"Response: {responseString}");
        }
        catch (HttpRequestException e)
        {
            MelonLogger.Error($"Request failed: {e.Message}");
        }
    }
}
