package com.electronichouse.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.SheetsScopes;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.Collections;
import java.util.List;

@Service
public class GoogleSheetsService {

    @Value("${google.sheets.spreadsheet-id}")
    private String spreadsheetId;

    @Value("${google.sheets.credentials-path}")
    private String credentialsPath;

    // ─── TAB NAMES ──────────────────────────────────────
    public static final String TAB_PRODUCTS  = "Products";
    public static final String TAB_CUSTOMERS = "Customers";
    public static final String TAB_ORDERS    = "Orders";

    private Sheets getSheetsService() throws Exception {
        InputStream credentialsStream = new ClassPathResource(credentialsPath).getInputStream();
        GoogleCredentials credentials = GoogleCredentials
                .fromStream(credentialsStream)
                .createScoped(Collections.singleton(SheetsScopes.SPREADSHEETS));
        return new Sheets.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JacksonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("Electronic House")
                .build();
    }

    public List<List<Object>> readSheet(String range) throws Exception {
        Sheets service = getSheetsService();
        ValueRange response = service.spreadsheets().values()
                .get(spreadsheetId, range)
                .execute();
        return response.getValues();
    }

    public void appendRow(String range, List<Object> rowData) throws Exception {
        Sheets service = getSheetsService();
        ValueRange body = new ValueRange()
                .setValues(Collections.singletonList(rowData));
        service.spreadsheets().values()
                .append(spreadsheetId, range, body)
                .setValueInputOption("RAW")
                .execute();
    }

    public void updateRow(String range, List<Object> rowData) throws Exception {
        Sheets service = getSheetsService();
        ValueRange body = new ValueRange()
                .setValues(Collections.singletonList(rowData));
        service.spreadsheets().values()
                .update(spreadsheetId, range, body)
                .setValueInputOption("RAW")
                .execute();
    }

    public void deleteRow(String range) throws Exception {
        Sheets service = getSheetsService();
        ValueRange body = new ValueRange()
                .setValues(Collections.singletonList(
                        Collections.nCopies(10, "")));
        service.spreadsheets().values()
                .update(spreadsheetId, range, body)
                .setValueInputOption("RAW")
                .execute();
    }

    public int findRowIndexById(String tabName, Object id) throws Exception {
        List<List<Object>> rows = readSheet(tabName + "!A2:H");
        if (rows == null) return -1;
        String targetId = String.valueOf(id);
        for (int i = 0; i < rows.size(); i++) {
            List<Object> row = rows.get(i);
            if (!row.isEmpty() && row.get(0) != null &&
                row.get(0).toString().trim().equals(targetId)) {
                return i + 2;
            }
        }
        return -1;
    }

    public String getSpreadsheetId() { return spreadsheetId; }
}