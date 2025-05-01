/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */
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