import ecdsa from 'starkbank-ecdsa';
import { SENDGRID_VERIFY_KEY } from '../../config';
import { checkUserTypeIsAdmin } from '../userType/userType.service';
import * as AdminService from './admin.service';

const Ecdsa = ecdsa.Ecdsa;
const Signature = ecdsa.Signature;
const PublicKey = ecdsa.PublicKey;

/**
 * Verify webhook sengrid
 * @param {*} publicKey public key generate of sengrid
 * @param {*} payload req.body (text(application/json))
 * @param {*} signature x-twilio-email-event-webhook-signature
 * @param {*} timestamp x-twilio-email-event-webhook-timestamp
 * @returns true/false
 */
const verifySignature = (publicKey, payload, signature, timestamp) => {
    let timestampPayload = typeof payload === 'object' ? JSON.stringify(payload) : payload;
    timestampPayload = timestamp + timestampPayload;
    const decodedSignature = Signature.fromBase64(signature);
    return Ecdsa.verify(timestampPayload, decodedSignature, publicKey);
};

export async function deliveryEmailWebhook(req, res) {
    try {
        const body = req.body;
        const payloadBody = req.rawBody.toString();
        const signature = req.headers['x-twilio-email-event-webhook-signature'];
        const timestamp = req.headers['x-twilio-email-event-webhook-timestamp'];
        const ecPublicKey = PublicKey.fromPem(SENDGRID_VERIFY_KEY);
        if (!signature || !timestamp || !ecPublicKey) {
            return res.status(401).send({
                success: false,
                payload: false
            });
        }
        const authentication = verifySignature(ecPublicKey, payloadBody, signature, timestamp);
        if (!authentication) {
            return res.status(401).send({
                success: false,
                payload: false
            });
        }
        await AdminService.handleEmailWebhook(body);
        return res.status(200).send({
            success: true,
            payload: true
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            payload: false
        });
    }
}

export async function getNameReleaseNotes(req, res) {
  try {
    await checkUserTypeIsAdmin(req.auth?.type);
    const notes = await AdminService.getNameReleaseNotes();
    return res.status(200).json({
      success: true,
      payload: notes
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      payload: false
    });
  }
}

export async function getInfoReleaseNote(req, res) {
    try {
        await checkUserTypeIsAdmin(req.auth?.type);
        const { note } = req.params;
        const payload = await AdminService.getInfoReleaseNote(note);
        return res.status(200).json({
            success: true,
            payload
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            payload: false
        });
    }
}

