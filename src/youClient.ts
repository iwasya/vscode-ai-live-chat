export type YouClientOptions = {
  apiKey: string;
  timeoutMs?: number;
};

type ResearchResponse = {
  output?: {
    content?: string;
    answer?: string;
    text?: string;
  };
  content?: string;
  answer?: string;
  text?: string;
  error?: {
    message?: string;
  };
  message?: string;
};

export class YouClient {
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(options: YouClientOptions) {
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs ?? 60000;
  }

  async research(input: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch('https://api.you.com/v1/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          input,
          research_effort: 'standard'
        }),
        signal: controller.signal
      });

      const rawText = await response.text();
      const data = this.parseResponse(rawText);

      if (!response.ok) {
        throw new Error(this.toFriendlyHttpError(response.status, data));
      }

      const answer = data.output?.content ?? data.output?.answer ?? data.output?.text ?? data.content ?? data.answer ?? data.text;
      if (!answer || !answer.trim()) {
        throw new Error('Tidak ada jawaban dari API.');
      }

      return answer.trim();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request terlalu lama. Coba lagi dengan konteks yang lebih pendek.');
      }

      if (error instanceof TypeError) {
        throw new Error('Gagal terhubung ke You.com API. Periksa koneksi internet.');
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private parseResponse(rawText: string): ResearchResponse {
    if (!rawText.trim()) {
      return {};
    }

    try {
      return JSON.parse(rawText) as ResearchResponse;
    } catch {
      return { text: rawText };
    }
  }

  private toFriendlyHttpError(status: number, data: ResearchResponse): string {
    const apiMessage = data.error?.message ?? data.message;

    if (status === 401 || status === 403) {
      return 'API key tidak valid atau tidak memiliki akses.';
    }

    if (status === 429) {
      return 'Limit request API tercapai. Coba lagi nanti.';
    }

    if (apiMessage) {
      return apiMessage;
    }

    return `Request You.com API gagal dengan status ${status}.`;
  }
}
