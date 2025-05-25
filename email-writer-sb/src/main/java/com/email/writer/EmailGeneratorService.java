package com.email.writer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {



    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private  String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApikey;

    @PostConstruct
    public void init() {
        System.out.println("Gemini API URL: " + geminiApiUrl);
        System.out.println("Gemini API Key: " + geminiApikey);
    }

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build() ;
    }

    public String  generateEmailReply(EmailRequest emailRequest){
        // build the promt
        String promt = buildPrompt(emailRequest);

        // after then craft the request, meaning format/destructure the response and send it
        Map<String, Object> reqBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", promt)
                        })
                }
        );

        System.out.println("URL: " + geminiApiUrl);

        String response = webClient.post().
                uri(geminiApiUrl+geminiApikey).
                header("Content-type", "application/json").
                bodyValue(reqBody).
                retrieve().
                bodyToMono(String.class).
                block();

        // first extrcat & return response
        return extractResponseContent(response);
    }

    private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);

            return root.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        } catch (Exception e) {
            return "Error occurred : " + e.getMessage() ;
        }
    }

    ;

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
         prompt.append("generate a professional email reply for the following content. Do not generate subject line ");
         if(emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()){
             prompt.append("Use a ").append(emailRequest.getTone()).append(" tone");
         }

         prompt.append("\n Original email: \n").append(emailRequest.getEmailContent());

        return prompt.toString();
    }
}
