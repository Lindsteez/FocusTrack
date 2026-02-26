import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../hooks/useLanguage";

type WeatherState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "ready";
      latitude: number;
      longitude: number;
      city: string;
      tempC: number;
      code: number;
    }
  | { status: "error"; message: string };

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
};

type NominatimReverseResponse = {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
  display_name?: string;
};

function codeToLabel(code: number): string {
  // Open-Meteo WMO weather interpretation codes.
  if (code === 0) return "Clear";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code === 51 || code === 53 || code === 55) return "Drizzle";
  if (code === 56 || code === 57) return " Freezingdrizzle";
  if (code === 61 || code === 63 || code === 65) return "Rain";
  if (code === 66 || code === 67) return "Freezing rain";
  if (code === 71 || code === 73 || code === 75) return "Snow";
  if (code === 77) return "Snow grains";
  if (code === 80 || code === 81 || code === 82) return "Rain showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code === 95) return "Thunderstorm";
  if (code === 96 || code === 99) return "Thunderstorm (hail)";
  return `Code ${code}`;
}

async function reverseGeocodeCity(latitude: number, longitude: number): Promise<string> {
  // Nominatim reverse geocoding docs. :contentReference[oaicite:7]{index=7}
  const url =
    "https://nominatim.openstreetmap.org/reverse" +
    `?format=jsonv2` +
    `&lat=${encodeURIComponent(latitude)}` +
    `&lon=${encodeURIComponent(longitude)}`;

  // Usage policy includes identification + rate limiting. :contentReference[oaicite:8]{index=8}
  const res = await fetch(url, {
    headers: {
      // Helps return names in the user's browser language when available
      "Accept-Language": navigator.language || "en",
    },
  });

  if (!res.ok) throw new Error(`Reverse geocoding failed: ${res.status}`);

  const data = (await res.json()) as NominatimReverseResponse;

  const a = data.address;
  const city =
    a?.city ||
    a?.town ||
    a?.village ||
    a?.municipality ||
    a?.county ||
    a?.state ||
    data.display_name;

  if (!city) return "Unknown location";

  // If display_name is used, it can be long; otherwise keep just the place name.
  return city;
}

export default function Weather() {
  const { t } = useLanguage();
  const [state, setState] = useState<WeatherState>({ status: "idle" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setState({ status: "loading" });

      if (!("geolocation" in navigator)) {
        setState({ status: "error", message: "Geolocation is not supported in this browser." });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            if (cancelled) return;

            const latitude = pos.coords.latitude;
            const longitude = pos.coords.longitude;

            // 1) Open-Meteo current weather (temp + weather_code). :contentReference[oaicite:9]{index=9}
            const weatherUrl =
              "https://api.open-meteo.com/v1/forecast" +
              `?latitude=${encodeURIComponent(latitude)}` +
              `&longitude=${encodeURIComponent(longitude)}` +
              `&current=temperature_2m,weather_code` +
              `&temperature_unit=celsius` +
              `&timezone=auto`;

            const weatherRes = await fetch(weatherUrl);
            if (!weatherRes.ok) throw new Error(`Open-Meteo request failed: ${weatherRes.status}`);

            const weatherData = (await weatherRes.json()) as OpenMeteoResponse;
            const tempC = weatherData.current?.temperature_2m;
            const code = weatherData.current?.weather_code;

            if (typeof tempC !== "number" || typeof code !== "number") {
              throw new Error("Open-Meteo response missing current weather data.");
            }

            // 2) Reverse geocode coords -> city name (Nominatim). :contentReference[oaicite:10]{index=10}
            const city = await reverseGeocodeCity(latitude, longitude);

            if (cancelled) return;

            setState({
              status: "ready",
              latitude,
              longitude,
              city,
              tempC,
              code,
            });
          } catch (err) {
            if (cancelled) return;
            setState({
              status: "error",
              message: err instanceof Error ? err.message : "Unknown error",
            });
          }
        },
        (err) => {
          if (cancelled) return;
          setState({ status: "error", message: err.message });
        },
        {
          enableHighAccuracy: false,
          timeout: 10_000,
          maximumAge: 10 * 60 * 1000,
        }
      );
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const view = useMemo(() => {
    switch (state.status) {
      case "idle":
      case "loading":
        return { location: `${t('weather.locating')}`, temp: "—", label: "—" };

      case "error":
        return { location: `${t('weather.off')}`, temp: "—", label: "—" };

      case "ready":
        return {
          location: state.city,
          temp: `${Math.round(state.tempC)}°C`,
          label: codeToLabel(state.code),
        };
    }
  }, [state]);

  return (
    <div aria-label="Current weather">
      <div>{view.location}</div>
      <div>
        {view.temp} • {view.label}
      </div>
    </div>
  );
}
