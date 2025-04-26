using System;
using System.IO;
using QRCoder;

namespace TaskTrackerAPI.Helpers;

public class QRCodeHelper
{
    private readonly QRCodeGenerator _qrGenerator;

    public QRCodeHelper(QRCodeGenerator qrGenerator)
    {
        _qrGenerator = qrGenerator;
    }

    public string GenerateQRCodeBase64(string data)
    {
        QRCodeData qrCodeData = _qrGenerator.CreateQrCode(data, QRCodeGenerator.ECCLevel.Q);
        BitmapByteQRCode qrCode = new BitmapByteQRCode(qrCodeData);
        byte[] qrCodeBytes = qrCode.GetGraphic(20);
        return Convert.ToBase64String(qrCodeBytes);
    }

    public byte[] GenerateQRCodeBytes(string data)
    {
        QRCodeData qrCodeData = _qrGenerator.CreateQrCode(data, QRCodeGenerator.ECCLevel.Q);
        BitmapByteQRCode qrCode = new BitmapByteQRCode(qrCodeData);
        return qrCode.GetGraphic(20);
    }

    public void SaveQRCodeToFile(string data, string filePath)
    {
        byte[] qrCodeBytes = GenerateQRCodeBytes(data);
        File.WriteAllBytes(filePath, qrCodeBytes);
    }
} 