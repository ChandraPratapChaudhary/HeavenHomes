package com.HeavenHomes.Heaven_Homes.hotel.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import javax.imageio.*;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.Base64;
import java.util.Iterator;

@Service
@Slf4j
public class FileStorageService {
    public String storeFile(MultipartFile file) {
        try {
            byte[] fileBytes = file.getBytes();
            String contentType = file.getContentType() != null && !file.getContentType().isEmpty() ? file.getContentType() : "image/jpeg";
            try {
                BufferedImage orig = ImageIO.read(new ByteArrayInputStream(fileBytes));
                if (orig != null) {
                    int w = orig.getWidth(), h = orig.getHeight(), max = 650;
                    if (w > max || h > max) {
                        double r = Math.min((double) max / w, (double) max / h);
                        w = Math.max(1, (int)(w * r)); h = Math.max(1, (int)(h * r));
                    }
                    BufferedImage resized = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
                    Graphics2D g = resized.createGraphics();
                    g.setColor(Color.WHITE); g.fillRect(0, 0, w, h);
                    g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                    g.drawImage(orig, 0, 0, w, h, null); g.dispose();
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
                    if (writers.hasNext()) {
                        ImageWriter writer = writers.next();
                        ImageOutputStream ios = ImageIO.createImageOutputStream(baos);
                        writer.setOutput(ios);
                        ImageWriteParam param = writer.getDefaultWriteParam();
                        if (param.canWriteCompressed()) { param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT); param.setCompressionQuality(0.70f); }
                        writer.write(null, new IIOImage(resized, null, null), param);
                        writer.dispose(); ios.close();
                    } else { ImageIO.write(resized, "jpg", baos); }
                    fileBytes = baos.toByteArray(); contentType = "image/jpeg";
                }
            } catch (Exception e) { log.warn("Image optimization skipped: {}", e.getMessage()); }
            return "data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(fileBytes);
        } catch (IOException ex) { throw new RuntimeException("Could not read uploaded image file.", ex); }
    }
    public void deleteFile(String fileUrl) { log.info("Removed image reference"); }
}
