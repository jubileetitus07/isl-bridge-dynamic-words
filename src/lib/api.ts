
// You can change this URL if your backend runs on a different address
const API_BASE_URL = "http://localhost:5000/api";

export interface SignToTextResponse {
  sign: string;
  confidence: number;
  error?: string;
}

export interface TextToSignResponse {
  signs: Array<{
    sign: string;
    image_path: string;
    match_type?: "exact" | "stemmed" | "partial";
    original?: string;
  }>;
  unmatched_words?: string[];
  error?: string;
}

export interface DictionaryResponse {
  signs: Array<{
    name: string;
    image_path: string;
  }>;
  error?: string;
}

export interface AddSignResponse {
  status: string;
  message?: string;
  error?: string;
}

export const translateSignToText = async (base64Image: string): Promise<SignToTextResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sign-to-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64_image: base64Image }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to translate sign");
    }

    return await response.json();
  } catch (error) {
    console.error("Error translating sign to text:", error);
    return { sign: "error", confidence: 0, error: (error as Error).message };
  }
};

export const translateTextToSign = async (text: string): Promise<TextToSignResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/text-to-sign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to translate text");
    }

    return await response.json();
  } catch (error) {
    console.error("Error translating text to sign:", error);
    return { signs: [], error: (error as Error).message };
  }
};

export const clearSignSequence = async (): Promise<{ status: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/clear-sequence`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to clear sequence");
    }

    return await response.json();
  } catch (error) {
    console.error("Error clearing sequence:", error);
    return { status: "error" };
  }
};

export const getISLDictionary = async (): Promise<DictionaryResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/isl-dictionary`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch dictionary");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching ISL dictionary:", error);
    return { signs: [], error: (error as Error).message };
  }
};

export const addSign = async (name: string, imagePath: string): Promise<AddSignResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/add-sign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, image_path: imagePath }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add sign");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding sign:", error);
    return { status: "error", error: (error as Error).message };
  }
};
